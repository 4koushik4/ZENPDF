from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import os
import tempfile
import subprocess
import shutil
from PyPDF2 import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader
from werkzeug.utils import secure_filename
from PIL import Image
import io
import img2pdf
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure CORS
CORS(app, resources={
    r"/*": {
        "origins": [
            "http://localhost:3000",  # Local development
            "https://zen-pdf.vercel.app",  # Your Vercel frontend domain
            "https://*.vercel.app"  # Any Vercel subdomain
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
        "expose_headers": ["Content-Disposition"],
        "supports_credentials": True
    }
})

def create_watermark_pdf(watermark_type, watermark_content, output_path, font_size=50, opacity=0.3, rotation=45, position='center', image_size=100):
    try:
        # Create output directory if it doesn't exist
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Create a PDF with ReportLab
        c = canvas.Canvas(output_path, pagesize=letter)
        
        if watermark_type == 'text':
            # Set font and color for text watermark
            c.setFont("Helvetica", font_size)
            c.setFillColorRGB(0.5, 0.5, 0.5, alpha=opacity)
            
            # Calculate position for text
            text_width = c.stringWidth(watermark_content, "Helvetica", font_size)
            if position == 'center':
                x = (letter[0] - text_width) / 2
                y = letter[1] / 2
            elif position == 'top-left':
                x = 50
                y = letter[1] - 50
            elif position == 'top-right':
                x = letter[0] - text_width - 50
                y = letter[1] - 50
            elif position == 'bottom-left':
                x = 50
                y = 50
            elif position == 'bottom-right':
                x = letter[0] - text_width - 50
                y = 50
            
            # Rotate and draw text
            c.translate(x, y)
            c.rotate(rotation)
            c.drawString(0, 0, watermark_content)
        else:
            # Handle image watermark
            img = Image.open(watermark_content)
            
            # Calculate image size based on percentage
            img_width, img_height = img.size
            scale_factor = image_size / 100.0
            new_width = img_width * scale_factor
            new_height = img_height * scale_factor
            
            # Calculate position for image
            if position == 'center':
                x = (letter[0] - new_width) / 2
                y = (letter[1] - new_height) / 2
            elif position == 'top-left':
                x = 50
                y = letter[1] - new_height - 50
            elif position == 'top-right':
                x = letter[0] - new_width - 50
                y = letter[1] - new_height - 50
            elif position == 'bottom-left':
                x = 50
                y = 50
            elif position == 'bottom-right':
                x = letter[0] - new_width - 50
                y = 50
            
            # Rotate and draw image
            c.translate(x + new_width/2, y + new_height/2)
            c.rotate(rotation)
            c.translate(-new_width/2, -new_height/2)
            c.drawImage(ImageReader(img), 0, 0, width=new_width, height=new_height, mask='auto')
        
        c.save()
        return True
    except Exception as e:
        print(f"Error in create_watermark_pdf: {str(e)}")
        return False

def add_watermark(input_pdf, watermark_pdf, output_pdf, layer='above', selected_pages='all'):
    try:
        template = PdfReader(input_pdf)
        watermark = PdfReader(watermark_pdf)
        output = PdfWriter()

        # Parse selected pages
        pages_to_watermark = set()
        if selected_pages.lower() == 'all':
            pages_to_watermark = set(range(len(template.pages)))
        else:
            for part in selected_pages.split(','):
                if '-' in part:
                    start, end = map(int, part.split('-'))
                    pages_to_watermark.update(range(start-1, end))
                else:
                    pages_to_watermark.add(int(part)-1)

        for i in range(len(template.pages)):
            page = template.pages[i]
            if i in pages_to_watermark:
                if layer == 'above':
                    page.merge_page(watermark.pages[0])
                else:  # below
                    watermark_page = watermark.pages[0]
                    watermark_page.merge_page(page)
                    page = watermark_page
            output.add_page(page)

        with open(output_pdf, 'wb') as file:
            output.write(file)
        return True
    except Exception as e:
        print(f"Error in add_watermark: {str(e)}")
        return False

@app.route('/', methods=['GET'])
def home():
    return jsonify({"status": "ok", "message": "Server is running"})

@app.route('/watermark-pdf', methods=['POST'])
def watermark_pdf():
    temp_dir = None
    try:
        if 'file' not in request.files:
            return {'error': 'No file part'}, 400
        
        file = request.files['file']
        if file.filename == '':
            return {'error': 'No selected file'}, 400
        
        if not file.filename.lower().endswith('.pdf'):
            return {'error': 'File must be a PDF'}, 400
        
        watermark_type = request.form.get('watermarkType', 'text')
        if watermark_type not in ['text', 'image']:
            return {'error': 'Invalid watermark type'}, 400
        
        if watermark_type == 'text':
            watermark_content = request.form.get('watermarkText', '')
            if not watermark_content:
                return {'error': 'Watermark text is required'}, 400
        else:
            if 'watermarkImage' not in request.files:
                return {'error': 'No watermark image provided'}, 400
            watermark_content = request.files['watermarkImage']
            if watermark_content.filename == '':
                return {'error': 'No selected watermark image'}, 400
            if not watermark_content.filename.lower().endswith(('.jpg', '.jpeg', '.png')):
                return {'error': 'Watermark image must be JPEG or PNG'}, 400
        
        # Get watermark options
        position = request.form.get('position', 'center')
        transparency = float(request.form.get('transparency', 0.3))
        rotation = float(request.form.get('rotation', 45))
        layer = request.form.get('layer', 'above')
        selected_pages = request.form.get('selectedPages', 'all')
        font_size = int(request.form.get('fontSize', 50))
        image_size = int(request.form.get('imageSize', 100))
        
        # Create a temporary directory
        temp_dir = tempfile.mkdtemp()
        
        # Save the uploaded file
        input_path = os.path.join(temp_dir, secure_filename(file.filename))
        file.save(input_path)
        
        # Create watermark PDF
        watermark_path = os.path.join(temp_dir, 'watermark.pdf')
        
        if watermark_type == 'text':
            if not create_watermark_pdf('text', watermark_content, watermark_path, font_size, transparency, rotation, position):
                return {'error': 'Failed to create watermark'}, 500
        else:
            # Save the watermark image temporarily
            watermark_image_path = os.path.join(temp_dir, secure_filename(watermark_content.filename))
            watermark_content.save(watermark_image_path)
            if not create_watermark_pdf('image', watermark_image_path, watermark_path, font_size, transparency, rotation, position, image_size):
                return {'error': 'Failed to create watermark'}, 500
        
        # Set output path
        output_filename = f"watermarked_{secure_filename(file.filename)}"
        output_path = os.path.join(temp_dir, output_filename)
        
        # Apply watermark
        if not add_watermark(input_path, watermark_path, output_path, layer, selected_pages):
            return {'error': 'Failed to apply watermark'}, 500
        
        # Read the file into memory
        with open(output_path, 'rb') as f:
            file_data = f.read()
        
        # Clean up temporary files
        try:
            if os.path.exists(input_path):
                os.unlink(input_path)
            if os.path.exists(watermark_path):
                os.unlink(watermark_path)
            if os.path.exists(output_path):
                os.unlink(output_path)
            if watermark_type == 'image' and os.path.exists(watermark_image_path):
                os.unlink(watermark_image_path)
        except Exception as e:
            print(f"Warning: Error during cleanup: {str(e)}")
        
        # Send the file data from memory
        return send_file(
            io.BytesIO(file_data),
            as_attachment=True,
            download_name=output_filename,
            mimetype='application/pdf',
            cache_timeout=0,
            etag=False,
            last_modified=None
        )
    
    except Exception as e:
        print(f"Error in watermark_pdf: {str(e)}")
        return {'error': str(e)}, 500
    finally:
        # Clean up the temporary directory
        if temp_dir and os.path.exists(temp_dir):
            try:
                shutil.rmtree(temp_dir)
            except Exception as e:
                print(f"Warning: Error removing temp directory: {str(e)}")

@app.route('/protect-pdf', methods=['POST'])
def protect_pdf():
    temp_input = None
    temp_output = None
    try:
        if 'file' not in request.files:
            return {'error': 'No file provided'}, 400
        
        file = request.files['file']
        if file.filename == '':
            return {'error': 'No selected file'}, 400
            
        if not file.filename.lower().endswith('.pdf'):
            return {'error': 'File must be a PDF'}, 400
            
        password = request.form.get('password')
        if not password:
            return {'error': 'No password provided'}, 400

        # Create a temporary file to store the uploaded PDF
        temp_input = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        file.save(temp_input.name)
        temp_input.close()

        # Create PDF reader and writer objects
        reader = PdfReader(temp_input.name)
        writer = PdfWriter()

        # Copy all pages to the writer
        for page in reader.pages:
            writer.add_page(page)

        # Encrypt the PDF
        writer.encrypt(password)

        # Create a temporary file for the encrypted PDF
        temp_output = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        temp_output.close()

        # Write the encrypted PDF to the temporary file
        with open(temp_output.name, 'wb') as output_file:
            writer.write(output_file)

        # Clean up the input temporary file
        if os.path.exists(temp_input.name):
            os.unlink(temp_input.name)

        # Send the encrypted PDF
        return send_file(
            temp_output.name,
            as_attachment=True,
            download_name=f"protected_{secure_filename(file.filename)}",
            mimetype='application/pdf',
            cache_timeout=0,
            etag=False,
            last_modified=None
        )

    except Exception as e:
        print(f"Error in protect_pdf: {str(e)}")
        return {'error': str(e)}, 500
    finally:
        # Clean up temporary files if they still exist
        if temp_input and os.path.exists(temp_input.name):
            try:
                os.unlink(temp_input.name)
            except:
                pass
        if temp_output and os.path.exists(temp_output.name):
            try:
                os.unlink(temp_output.name)
            except:
                pass

@app.route('/unlock-pdf', methods=['POST'])
def unlock_pdf():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if not file or not file.filename.lower().endswith('.pdf'):
            return jsonify({'error': 'Invalid file. Please provide a PDF file'}), 400
        
        password = request.form.get('password', '')  # Get password from form data
        fileName = request.form.get('fileName', 'unlocked_pdf')
        
        print(f"Processing file: {file.filename}")
        print(f"Password provided: {'Yes' if password else 'No'}")
        
        # Create a temporary file to store the uploaded PDF
        temp_input = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
        file.save(temp_input.name)
        temp_input.close()
        print(f"Saved input file to: {temp_input.name}")

        try:
            # Create PDF reader object
            reader = PdfReader(temp_input.name)
            print(f"PDF is encrypted: {reader.is_encrypted}")
            
            # Check if PDF is encrypted
            if reader.is_encrypted:
                print("PDF is encrypted, attempting to decrypt...")
                
                # First try with provided password
                if password:
                    try:
                        success = reader.decrypt(password)
                        print(f"Decryption with provided password {'succeeded' if success else 'failed'}")
                        if not success:
                            return jsonify({'error': 'Incorrect password provided'}), 400
                    except Exception as e:
                        print(f"Error decrypting with provided password: {str(e)}")
                        return jsonify({'error': 'Incorrect password provided'}), 400
                else:
                    # If no password provided, try common passwords
                    common_passwords = [
                        '',  # Empty password
                        'password',
                        '123456',
                        'admin',
                        'user',
                        '1234',
                        '12345',
                        '12345678',
                        'qwerty',
                        'abc123',
                        '0000',
                        '1111',
                        '2222',
                        '3333',
                        '4444',
                        '5555',
                        '6666',
                        '7777',
                        '8888',
                        '9999',
                        # Add more common passwords
                        'admin123',
                        'password123',
                        'welcome',
                        'welcome123',
                        'test',
                        'test123',
                        'guest',
                        'guest123',
                        'default',
                        'default123',
                        'user123',
                        'admin1234',
                        'password1234',
                        '123456789',
                        '1234567890',
                        'qwerty123',
                        'qwerty1234',
                        'qwertyuiop',
                        'asdfghjk',
                        'zxcvbnm',
                        'qwerty1',
                        'qwerty12',
                        'qwerty123',
                        'qwerty1234',
                        'qwerty12345',
                        'qwerty123456',
                        'qwerty1234567',
                        'qwerty12345678',
                        'qwerty123456789',
                        'qwerty1234567890',
                        'qwertyuiop123',
                        'qwertyuiop1234',
                        'qwertyuiop12345',
                        'qwertyuiop123456',
                        'qwertyuiop1234567',
                        'qwertyuiop12345678',
                        'qwertyuiop123456789',
                        'qwertyuiop1234567890',
                        'asdfghjk123',
                        'asdfghjk1234',
                        'asdfghjk12345',
                        'asdfghjk123456',
                        'asdfghjk1234567',
                        'asdfghjk12345678',
                        'asdfghjk123456789',
                        'asdfghjk1234567890',
                        'zxcvbnm123',
                        'zxcvbnm1234',
                        'zxcvbnm12345',
                        'zxcvbnm123456',
                        'zxcvbnm1234567',
                        'zxcvbnm12345678',
                        'zxcvbnm123456789',
                        'zxcvbnm1234567890',
                        'qwerty1!',
                        'qwerty12!',
                        'qwerty123!',
                        'qwerty1234!',
                        'qwerty12345!',
                        'qwerty123456!',
                        'qwerty1234567!',
                        'qwerty12345678!',
                        'qwerty123456789!',
                        'qwerty1234567890!',
                        'qwertyuiop1!',
                        'qwertyuiop12!',
                        'qwertyuiop123!',
                        'qwertyuiop1234!',
                        'qwertyuiop12345!',
                        'qwertyuiop123456!',
                        'qwertyuiop1234567!',
                        'qwertyuiop12345678!',
                        'qwertyuiop123456789!',
                        'qwertyuiop1234567890!'
                    ]
                    decrypted = False
                    for pwd in common_passwords:
                        try:
                            print(f"Trying password: {pwd}")
                            # Create a new reader for each attempt to avoid state issues
                            temp_reader = PdfReader(temp_input.name)
                            success = temp_reader.decrypt(pwd)
                            if success:
                                print(f"Successfully decrypted with password: {pwd}")
                                reader = temp_reader  # Use the successful reader
                                decrypted = True
                                break
                        except Exception as e:
                            print(f"Failed to decrypt with password {pwd}: {str(e)}")
                            continue
                    
                    if not decrypted:
                        print("All password attempts failed")
                        return jsonify({'error': 'Could not decrypt PDF. Please provide the correct password.'}), 400

            # Create PDF writer object
            writer = PdfWriter()

            # Copy all pages to the writer
            for page in reader.pages:
                writer.add_page(page)

            # Create a temporary file for the unlocked PDF
            temp_output = tempfile.NamedTemporaryFile(delete=False, suffix='.pdf')
            temp_output.close()
            print(f"Created output file: {temp_output.name}")

            # Write the unlocked PDF to the temporary file
            with open(temp_output.name, 'wb') as output_file:
                writer.write(output_file)
            print("Successfully wrote unlocked PDF")

            # Clean up the input temporary file
            try:
                os.unlink(temp_input.name)
                print("Cleaned up input file")
            except Exception as e:
                print(f"Warning: Could not delete input file: {str(e)}")

            # Send the unlocked PDF
            return send_file(
                temp_output.name,
                as_attachment=True,
                download_name=f'{fileName}.pdf',
                mimetype='application/pdf',
                cache_timeout=0,
                etag=False,
                last_modified=None
            )

        except Exception as e:
            print(f"Error processing PDF: {str(e)}")
            if "encrypted" in str(e).lower():
                return jsonify({'error': 'Could not decrypt PDF. Please provide the correct password.'}), 400
            return jsonify({'error': str(e)}), 500

    except Exception as e:
        print(f"Error in unlock_pdf: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/compress', methods=['POST'])
def compress_pdf():
    temp_dir = None
    try:
        if 'file' not in request.files:
            return {'error': 'No file provided'}, 400
        
        file = request.files['file']
        if file.filename == '':
            return {'error': 'No selected file'}, 400
            
        if not file.filename.lower().endswith('.pdf'):
            return {'error': 'File must be a PDF'}, 400

        # Create a temporary directory
        temp_dir = tempfile.mkdtemp()
        
        # Save the uploaded file
        input_path = os.path.join(temp_dir, secure_filename(file.filename))
        file.save(input_path)
        
        # Get original file size in bytes
        original_size_bytes = os.path.getsize(input_path)
        original_size_mb = original_size_bytes / (1024 * 1024)  # Convert to MB
        
        # Create output path
        output_path = os.path.join(temp_dir, f"compressed_{secure_filename(file.filename)}")

        # Try using ghostscript for compression if available
        try:
            # Ghostscript compression command
            gs_command = [
                'gs',
                '-sDEVICE=pdfwrite',
                '-dCompatibilityLevel=1.4',
                '-dPDFSETTINGS=/ebook',
                '-dNOPAUSE',
                '-dQUIET',
                '-dBATCH',
                f'-sOutputFile={output_path}',
                input_path
            ]
            
            # Run ghostscript
            subprocess.run(gs_command, check=True)
            
            # Check if ghostscript compression was successful
            if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
                compressed_size_bytes = os.path.getsize(output_path)
                compressed_size_mb = compressed_size_bytes / (1024 * 1024)
                compression_ratio = ((original_size_bytes - compressed_size_bytes) / original_size_bytes) * 100
                
                # Read the compressed file
                with open(output_path, 'rb') as f:
                    file_data = f.read()
                
                # Send the compressed PDF with compression info in headers
                response = send_file(
                    io.BytesIO(file_data),
                    as_attachment=True,
                    download_name=f"compressed_{secure_filename(file.filename)}",
                    mimetype='application/pdf',
                    cache_timeout=0,
                    etag=False,
                    last_modified=None
                )
                
                # Add compression info to headers
                response.headers['X-Original-Size'] = f"{original_size_mb:.2f}"
                response.headers['X-Compressed-Size'] = f"{compressed_size_mb:.2f}"
                response.headers['X-Compression-Ratio'] = f"{compression_ratio:.1f}"
                
                return response
        except Exception as e:
            print(f"Ghostscript compression failed, falling back to PyPDF2: {str(e)}")

        # Fallback to PyPDF2 compression
        reader = PdfReader(input_path)
        writer = PdfWriter()

        # Copy all pages to the writer with compression
        for page in reader.pages:
            # Create a new page
            new_page = writer.add_page(page)
            
            # Compress the page content
            if '/Resources' in page:
                resources = page['/Resources']
                if '/XObject' in resources:
                    xobjects = resources['/XObject']
                    for key in xobjects:
                        if xobjects[key]['/Subtype'] == '/Image':
                            # Compress images
                            xobjects[key]['/Filter'] = '/DCTDecode'
                            xobjects[key]['/ColorSpace'] = '/DeviceRGB'
                            xobjects[key]['/BitsPerComponent'] = 8

        # Set compression parameters
        writer.add_metadata(reader.metadata)
        
        # Write the compressed PDF with maximum compression
        with open(output_path, 'wb') as output_file:
            writer.write(output_file)

        # Get compressed size in bytes
        compressed_size_bytes = os.path.getsize(output_path)
        compressed_size_mb = compressed_size_bytes / (1024 * 1024)  # Convert to MB

        # Calculate compression ratio
        compression_ratio = ((original_size_bytes - compressed_size_bytes) / original_size_bytes) * 100

        # Read the compressed file
        with open(output_path, 'rb') as f:
            file_data = f.read()

        # Clean up temporary files
        try:
            if os.path.exists(input_path):
                os.unlink(input_path)
            if os.path.exists(output_path):
                os.unlink(output_path)
        except Exception as e:
            print(f"Warning: Error during cleanup: {str(e)}")

        # Send the compressed PDF with compression info in headers
        response = send_file(
            io.BytesIO(file_data),
            as_attachment=True,
            download_name=f"compressed_{secure_filename(file.filename)}",
            mimetype='application/pdf',
            cache_timeout=0,
            etag=False,
            last_modified=None
        )
        
        # Add compression info to headers with proper formatting
        response.headers['X-Original-Size'] = f"{original_size_mb:.2f}"
        response.headers['X-Compressed-Size'] = f"{compressed_size_mb:.2f}"
        response.headers['X-Compression-Ratio'] = f"{compression_ratio:.1f}"
        
        return response

    except Exception as e:
        print(f"Error in compress_pdf: {str(e)}")
        return {'error': str(e)}, 500
    finally:
        # Clean up the temporary directory
        if temp_dir and os.path.exists(temp_dir):
            try:
                shutil.rmtree(temp_dir)
            except Exception as e:
                print(f"Warning: Error removing temp directory: {str(e)}")

@app.route('/test', methods=['GET'])
def test():
    return "PDF Server is running!"

if __name__ == '__main__':
    print("PDF Server running at http://localhost:5000")
    app.run(port=5000, debug=True) 