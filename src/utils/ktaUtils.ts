import { QRCodeSVG } from 'qrcode.react';
import { Employee } from '../components/admin/types';

export interface KTAOptions {
  employee: Employee;
}

export function generateEmployeeKTA(employee: Employee): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Create both front and back cards
      Promise.all([
        generateKTACard(employee, 'front'),
        generateKTACard(employee, 'back')
      ]).then(([frontBlob, backBlob]) => {
        // Create ZIP file
        createZipFile(employee, frontBlob, backBlob).then(() => {
          resolve();
        }).catch(reject);
      }).catch(reject);
    } catch (error) {
      reject(error);
    }
  });
}

function generateKTACard(employee: Employee, side: 'front' | 'back'): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      // Create canvas with exact same proportions as preview
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Use exact same dimensions as preview (320x500 ratio)
      const width = 640;
      const height = 1000;
      
      canvas.width = width;
      canvas.height = height;

      if (side === 'front') {
        generateKTAFrontCanvas(ctx, employee, width, height).then(() => {
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to generate front card blob'));
            }
          }, 'image/jpeg', 0.95);
        }).catch(reject);
      } else {
        generateKTABackCanvas(ctx, employee, width, height);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to generate back card blob'));
          }
        }, 'image/jpeg', 0.95);
      }
    } catch (error) {
      reject(error);
    }
  });
}

function generateKTAFrontCanvas(ctx: CanvasRenderingContext2D, employee: Employee, width: number, height: number): Promise<void> {
  return new Promise((resolve, reject) => {
    // Create exact same gradient as preview
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, '#3B82F6'); // Blue
    gradient.addColorStop(0.5, '#1D4ED8'); // Darker blue
    gradient.addColorStop(1, '#7C3AED'); // Purple
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Add decorative circles with exact same positioning as preview
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = 'white';
    
    // Top left circle
    ctx.beginPath();
    ctx.arc(-width * 0.1, -height * 0.05, width * 0.25, 0, 2 * Math.PI);
    ctx.fill();
    
    // Top right circle
    ctx.beginPath();
    ctx.arc(width * 1.1, -height * 0.05, width * 0.2, 0, 2 * Math.PI);
    ctx.fill();
    
    // Bottom left circle
    ctx.beginPath();
    ctx.arc(-width * 0.1, height * 1.05, width * 0.3, 0, 2 * Math.PI);
    ctx.fill();
    
    // Bottom right circle
    ctx.beginPath();
    ctx.arc(width * 1.1, height * 1.05, width * 0.25, 0, 2 * Math.PI);
    ctx.fill();

    // Orange accent circles
    ctx.fillStyle = 'rgba(251, 146, 60, 0.15)';
    ctx.beginPath();
    ctx.arc(width * 0.85, height * 0.1, width * 0.12, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(width * 0.15, height * 0.9, width * 0.15, 0, 2 * Math.PI);
    ctx.fill();

    ctx.globalAlpha = 1;

    // Company header section - exact positioning as preview
    const headerY = height * 0.08;
    
    // Company logo circle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.arc(width * 0.15, headerY, width * 0.06, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.fillStyle = '#3B82F6';
    ctx.beginPath();
    ctx.arc(width * 0.15, headerY, width * 0.04, 0, 2 * Math.PI);
    ctx.fill();

    // Company name - exact positioning and size as preview
    ctx.fillStyle = 'white';
    ctx.font = `bold ${width * 0.08}px Arial, sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText('Pertamina', width * 0.25, headerY + width * 0.02);

    // Generate and add QR code with exact positioning as preview
    generateQRCodeImage(employee.qrCode).then((qrDataUrl) => {
      const qrImg = new Image();
      qrImg.onload = () => {
        // QR Code positioning - exact same as preview
        const qrSize = width * 0.375; // Larger QR code like in preview
        const qrX = width * 0.3125; // Centered horizontally
        const qrY = height * 0.2; // Positioned after header
        
        // White background for QR code with padding
        const padding = width * 0.02;
        ctx.fillStyle = 'white';
        ctx.fillRect(qrX - padding, qrY - padding, qrSize + (padding * 2), qrSize + (padding * 2));
        
        // Draw QR code
        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

        // Employee name - exact positioning as preview
        ctx.fillStyle = 'white';
        ctx.font = `bold ${width * 0.08}px Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(employee.name, width * 0.5, height * 0.62);

        // Position - exact positioning as preview
        ctx.font = `${width * 0.05}px Arial, sans-serif`;
        ctx.fillStyle = 'rgba(200, 220, 255, 1)';
        ctx.fillText(employee.position, width * 0.5, height * 0.68);

        // Employee details section - exact layout as preview
        ctx.font = `${width * 0.032}px Arial, sans-serif`;
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        
        const detailsStartY = height * 0.78;
        const lineHeight = height * 0.04;
        const leftMargin = width * 0.08;
        
        // Format details exactly like preview
        ctx.fillText(`No. ID`, leftMargin, detailsStartY);
        ctx.fillText(`: ${employee.qrId}`, leftMargin + width * 0.25, detailsStartY);
        
        ctx.fillText(`Tanggal Lahir`, leftMargin, detailsStartY + lineHeight);
        ctx.fillText(`: ${formatBirthDate(employee.birthDate)}`, leftMargin + width * 0.25, detailsStartY + lineHeight);
        
        ctx.fillText(`Telepon`, leftMargin, detailsStartY + lineHeight * 2);
        ctx.fillText(`: ${employee.phone}`, leftMargin + width * 0.25, detailsStartY + lineHeight * 2);

        resolve();
      };
      
      qrImg.onerror = () => {
        reject(new Error('Failed to load QR code image'));
      };
      
      qrImg.src = qrDataUrl;
    }).catch(reject);
  });
}

function generateKTABackCanvas(ctx: CanvasRenderingContext2D, employee: Employee, width: number, height: number): void {
  // Create exact same gradient as front
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#3B82F6');
  gradient.addColorStop(0.5, '#1D4ED8');
  gradient.addColorStop(1, '#7C3AED');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Add decorative circles (mirrored from front)
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = 'white';
  
  // Mirrored circles
  ctx.beginPath();
  ctx.arc(width * 1.1, -height * 0.05, width * 0.25, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(-width * 0.1, -height * 0.05, width * 0.2, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(width * 1.1, height * 1.05, width * 0.3, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(-width * 0.1, height * 1.05, width * 0.25, 0, 2 * Math.PI);
  ctx.fill();

  // Orange accent circles
  ctx.fillStyle = 'rgba(251, 146, 60, 0.15)';
  ctx.beginPath();
  ctx.arc(width * 0.15, height * 0.1, width * 0.12, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(width * 0.85, height * 0.9, width * 0.15, 0, 2 * Math.PI);
  ctx.fill();

  ctx.globalAlpha = 1;

  // Company header section - same as front
  const headerY = height * 0.08;
  
  // Company logo circle
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.beginPath();
  ctx.arc(width * 0.15, headerY, width * 0.06, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.fillStyle = '#3B82F6';
  ctx.beginPath();
  ctx.arc(width * 0.15, headerY, width * 0.04, 0, 2 * Math.PI);
  ctx.fill();

  // Company name
  ctx.fillStyle = 'white';
  ctx.font = `bold ${width * 0.08}px Arial, sans-serif`;
  ctx.textAlign = 'left';
  ctx.fillText('Pertamina', width * 0.25, headerY + width * 0.02);

  // Terms & Conditions title - centered and properly spaced
  ctx.font = `bold ${width * 0.08}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('Terms &', width * 0.5, height * 0.28);
  ctx.fillText('Conditions', width * 0.5, height * 0.36);

  // Terms text - properly formatted and spaced
  ctx.font = `${width * 0.028}px Arial, sans-serif`;
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';

  const termsText = [
    'By using the services provided by Larana,',
    'Inc., you agree to comply with our terms',
    'and conditions, which outline your rights',
    'and responsibilities while accessing our',
    'digital banking solutions.',
    '',
    'These terms govern your use of our',
    'services, including any content, features,',
    'and functionalities, you acknowledge',
    'that you have read, understood, and',
    'accepted these terms.'
  ];

  const startY = height * 0.45;
  const lineHeight = height * 0.035;

  termsText.forEach((line, index) => {
    if (line.trim() !== '') {
      ctx.fillText(line, width * 0.5, startY + (index * lineHeight));
    }
  });
}

function generateQRCodeImage(qrValue: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Create a temporary div to render QR code
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      document.body.appendChild(tempDiv);

      // Import React and ReactDOM dynamically
      import('react-dom/client').then(({ createRoot }) => {
        import('react').then((React) => {
          const root = createRoot(tempDiv);
          
          // Render QR code with exact same settings as preview
          root.render(
            React.createElement(QRCodeSVG, {
              value: qrValue,
              size: 240, // Larger size for better quality
              level: 'M',
              includeMargin: false,
              style: { width: '100%', height: '100%' }
            })
          );

          // Wait for render and convert to image
          setTimeout(() => {
            const svgElement = tempDiv.querySelector('svg');
            if (svgElement) {
              const svgData = new XMLSerializer().serializeToString(svgElement);
              const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
              const url = URL.createObjectURL(svgBlob);

              const img = new Image();
              img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                canvas.width = 240;
                canvas.height = 240;
                
                if (ctx) {
                  ctx.fillStyle = 'white';
                  ctx.fillRect(0, 0, 240, 240);
                  ctx.drawImage(img, 0, 0, 240, 240);
                  
                  const dataUrl = canvas.toDataURL('image/png');
                  
                  // Cleanup
                  document.body.removeChild(tempDiv);
                  URL.revokeObjectURL(url);
                  resolve(dataUrl);
                } else {
                  document.body.removeChild(tempDiv);
                  URL.revokeObjectURL(url);
                  reject(new Error('Could not get canvas context for QR code'));
                }
              };

              img.onerror = () => {
                document.body.removeChild(tempDiv);
                URL.revokeObjectURL(url);
                reject(new Error('Failed to load QR code SVG'));
              };

              img.src = url;
            } else {
              document.body.removeChild(tempDiv);
              reject(new Error('Failed to generate QR code SVG'));
            }
          }, 200);
        }).catch(reject);
      }).catch(reject);
    } catch (error) {
      reject(error);
    }
  });
}

async function createZipFile(employee: Employee, frontBlob: Blob, backBlob: Blob): Promise<void> {
  // Import JSZip dynamically
  const JSZip = (await import('jszip')).default;
  
  const zip = new JSZip();
  
  // Add files to zip
  const employeeName = employee.name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '');
  zip.file(`KTA-${employeeName}-Depan.jpg`, frontBlob);
  zip.file(`KTA-${employeeName}-Belakang.jpg`, backBlob);
  
  // Generate zip file
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  
  // Download zip file
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `KTA-${employeeName}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function formatBirthDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}