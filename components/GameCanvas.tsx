
import React, { useRef, useEffect } from 'react';
import { GameState, StreetProp } from '../types';

interface Props {
  gameState: GameState;
}

const GameCanvas: React.FC<Props> = ({ gameState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationTime = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement('canvas');
    }
    const lCanvas = offscreenCanvasRef.current;
    const lctx = lCanvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (lCanvas) {
        lCanvas.width = canvas.width;
        lCanvas.height = canvas.height;
      }
    };
    window.addEventListener('resize', resize);
    resize();

    const groundY = canvas.height * 0.75;

    const drawProp = (p: StreetProp, screenX: number) => {
      const baseColor = '#4b5563';
      const detailColor = '#1f2937';
      ctx.fillStyle = baseColor;
      const y = groundY - p.height;
      
      switch (p.type) {
        case 'box':
          ctx.fillRect(screenX, y, p.width, p.height);
          ctx.strokeStyle = detailColor;
          ctx.lineWidth = 2;
          ctx.strokeRect(screenX + 2, y + 2, p.width - 4, p.height - 4);
          ctx.beginPath();
          ctx.moveTo(screenX, y); ctx.lineTo(screenX + p.width, y + p.height);
          ctx.moveTo(screenX + p.width, y); ctx.lineTo(screenX, y + p.height);
          ctx.stroke();
          break;
        case 'barrel':
          ctx.fillRect(screenX, y, p.width, p.height);
          ctx.fillStyle = detailColor;
          ctx.fillRect(screenX + 2, y + 5, p.width - 4, 3);
          ctx.fillRect(screenX + 2, y + p.height - 8, p.width - 4, 3);
          ctx.strokeStyle = detailColor;
          ctx.lineWidth = 1;
          ctx.strokeRect(screenX, y, p.width, p.height);
          break;
      }
    };

    const drawMuzzleSpike = (x: number, y: number, angle: number, length: number, width: number, color: string) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(length, -width / 2);
      ctx.lineTo(length * 1.1, 0);
      ctx.lineTo(length, width / 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const draw = () => {
      if (!canvas.width || !canvas.height || !lctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      animationTime.current += 0.15;
      
      const { player, lamps, props, pits, enemies, coins, collectingCoins, casings, bloodParticles, floatingTexts, rain, worldOffset, isMoving, muzzleFlash, lightningIntensity } = gameState;

      // Background Buildings - Silhouette pass
      const parallaxFactor = 0.2;
      for (let i = -5; i < 25; i++) {
        const bW = 180;
        const bH = 220 + (Math.abs(i * 137) % 100); 
        const x = (i * 350) - (worldOffset * parallaxFactor); 
        const bY = groundY - bH;
        if (x + bW < 0 || x > canvas.width) continue;
        ctx.fillStyle = '#0c0c0c';
        ctx.fillRect(x, bY, bW, bH);
      }

      ctx.fillStyle = '#0a0a0a';
      const screenRight = worldOffset + canvas.width;
      let currentX = worldOffset;
      const sortedPits = [...pits].sort((a, b) => a.x - b.x);
      
      sortedPits.forEach(pit => {
          if (pit.x + pit.width > worldOffset && pit.x < screenRight) {
              if (pit.x > currentX) {
                  const segWidth = pit.x - currentX;
                  const segX = currentX - worldOffset;
                  ctx.fillRect(segX, groundY, segWidth, canvas.height - groundY);
                  ctx.strokeStyle = '#444'; ctx.lineWidth = 2;
                  ctx.beginPath(); ctx.moveTo(segX, groundY); ctx.lineTo(segX + segWidth, groundY); ctx.stroke();
              }
              const pitScreenX = pit.x - worldOffset;
              const pitDepth = 300;
              ctx.fillStyle = 'rgba(60, 60, 60, 0.4)';
              ctx.fillRect(pitScreenX, groundY, 4, pitDepth);
              ctx.fillRect(pitScreenX + pit.width - 4, groundY, 4, pitDepth);
              const innerGrad = ctx.createLinearGradient(pitScreenX, groundY, pitScreenX + 20, groundY);
              innerGrad.addColorStop(0, 'rgba(80, 80, 80, 0.5)'); innerGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
              ctx.fillStyle = innerGrad; ctx.fillRect(pitScreenX, groundY, 20, pitDepth);
              const innerGradR = ctx.createLinearGradient(pitScreenX + pit.width, groundY, pitScreenX + pit.width - 20, groundY);
              innerGradR.addColorStop(0, 'rgba(80, 80, 80, 0.5)'); innerGradR.addColorStop(1, 'rgba(0, 0, 0, 0)');
              ctx.fillStyle = innerGradR; ctx.fillRect(pitScreenX + pit.width - 20, groundY, 20, pitDepth);
              ctx.strokeStyle = '#333'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(pitScreenX, groundY); ctx.lineTo(pitScreenX, groundY + pitDepth); ctx.moveTo(pitScreenX + pit.width, groundY); ctx.lineTo(pitScreenX + pit.width, groundY + pitDepth); ctx.stroke();
              currentX = Math.max(currentX, pit.x + pit.width);
          }
      });
      if (currentX < screenRight) {
          const segX = currentX - worldOffset;
          const segWidth = screenRight - currentX;
          ctx.fillRect(segX, groundY, segWidth, canvas.height - groundY);
          ctx.strokeStyle = '#444'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(segX, groundY); ctx.lineTo(segX + segWidth, groundY); ctx.stroke();
      }

      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 2;
      for (let i = -1; i < 30; i++) {
        const x = (i * 80) - (worldOffset % 80);
        ctx.beginPath(); ctx.moveTo(x, groundY); ctx.lineTo(x - 100, canvas.height); ctx.stroke();
      }

      props.forEach(p => {
        const screenX = p.x - worldOffset;
        if (screenX < -p.width || screenX > canvas.width) return;
        drawProp(p, screenX);
      });
      
      lamps.forEach(lamp => {
        const screenX = lamp.x - worldOffset;
        const lampY = groundY - 210;
        if (screenX < -200 || screenX > canvas.width + 200) return;
        ctx.fillStyle = '#1a1a1a'; ctx.fillRect(screenX - 4, groundY - 220, 8, 220); ctx.fillStyle = '#222222'; ctx.fillRect(screenX - 25, groundY - 225, 50, 15);
        const bulbAlpha = lamp.intensity / 0.9; ctx.fillStyle = `rgba(255, 247, 237, ${bulbAlpha})`;
        ctx.beginPath(); ctx.arc(screenX, lampY, 6, 0, Math.PI * 2); ctx.fill();
        if (lamp.isBroken && lamp.intensity > 0.4) {
          ctx.strokeStyle = `rgba(180, 200, 255, ${bulbAlpha * 0.4})`;
          ctx.beginPath(); ctx.moveTo(screenX, lampY); ctx.lineTo(screenX + (Math.random() - 0.5) * 15, lampY + (Math.random() - 0.5) * 15); ctx.stroke();
        }
      });

      // --- BILLBOARD (Drawn after lamps to stay in front of the pole) ---
      const bBoardWidth = 260;
      const bBoardHeight = 140;
      const targetLampX = 900; 
      const billboardScreenX = targetLampX - worldOffset - (bBoardWidth / 2);
      const bBoardTopY = groundY - 180; 

      if (billboardScreenX > -bBoardWidth && billboardScreenX < canvas.width + 100) {
          // Support Structure (Optional: can be behind or in front, usually looks better slightly offset or behind)
          ctx.fillStyle = '#050505';
          ctx.fillRect(billboardScreenX + 50, groundY - 120, 10, 120);
          ctx.fillRect(billboardScreenX + bBoardWidth - 60, groundY - 120, 10, 120);
          
          // Board Face (Solid Opaque, covers the pole)
          ctx.fillStyle = '#0a0a0a';
          ctx.fillRect(billboardScreenX, bBoardTopY, bBoardWidth, bBoardHeight);
          
          // Border
          ctx.strokeStyle = '#1a1a1a';
          ctx.lineWidth = 4;
          ctx.strokeRect(billboardScreenX, bBoardTopY, bBoardWidth, bBoardHeight);
          
          // Text (Lit by the lamp bulb directly above it)
          ctx.save();
          ctx.font = 'bold 28px "Creepster", cursive';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#cccccc';
          ctx.fillText("THE STREETS", billboardScreenX + bBoardWidth / 2, bBoardTopY + 60);
          ctx.fillText("NEVER FORGET", billboardScreenX + bBoardWidth / 2, bBoardTopY + 105);
          ctx.restore();
      }

      enemies.forEach(enemy => {
        const screenX = enemy.x - worldOffset;
        if (screenX < -100 || screenX > canvas.width + 100) return;
        const enemyY = groundY + enemy.y - enemy.height;
        const jitterX = Math.sin(animationTime.current * 4) * 2;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.95)'; ctx.fillRect(screenX + jitterX, enemyY, enemy.width, enemy.height);
        if (enemy.isAggroed) {
          ctx.strokeStyle = '#4b5563'; ctx.lineWidth = 1; ctx.strokeRect(screenX + jitterX, enemyY, enemy.width, enemy.height);
          ctx.fillStyle = '#ff0000'; ctx.shadowBlur = 15; ctx.shadowColor = 'red';
          ctx.fillRect(screenX + jitterX + 6, enemyY + 15, 8, 6); ctx.fillRect(screenX + jitterX + enemy.width - 14, enemyY + 15, 8, 6);
          ctx.shadowBlur = 0;
          ctx.fillStyle = 'rgba(31, 41, 55, 0.8)'; ctx.fillRect(screenX + jitterX, enemyY - 10, enemy.width, 4);
          ctx.fillStyle = '#dc2626'; const healthPct = Math.max(0, enemy.hp / enemy.maxHp); ctx.fillRect(screenX + jitterX, enemyY - 10, enemy.width * healthPct, 4);
        }
      });

      bloodParticles.forEach(bp => {
        const sx = bp.x - worldOffset; const sy = groundY + bp.y;
        if (sx < -20 || sx > canvas.width + 20) return;
        ctx.fillStyle = `rgba(180, 0, 0, ${bp.life})`; ctx.beginPath(); ctx.arc(sx, sy, bp.size, 0, Math.PI * 2); ctx.fill();
      });

      casings.forEach(c => {
        const sx = c.x - worldOffset; const sy = groundY + c.y;
        ctx.save(); ctx.translate(sx, sy); ctx.rotate(c.rotation); ctx.fillStyle = `rgba(251, 191, 36, ${c.life})`; ctx.fillRect(-2, -1, 4, 2); ctx.restore();
      });

      const pX = player.pos.x - worldOffset;
      const isJumping = player.pos.y < 0;
      let bobY = 0; let legAngle = 0;
      if (isMoving && !isJumping) { bobY = Math.sin(animationTime.current * 2) * 4; legAngle = Math.sin(animationTime.current * 2) * 15; }
      const pY = groundY + player.pos.y - player.height + bobY;
      ctx.strokeStyle = player.color; ctx.lineWidth = 4; ctx.lineCap = 'round';
      const drawLeg = (offset: number, angle: number) => {
        ctx.save(); ctx.translate(pX + player.width / 2 + offset, pY + player.height - 5);
        ctx.rotate((angle * Math.PI) / 180); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, 10); ctx.stroke(); ctx.restore();
      };
      if (!isJumping) { drawLeg(-6, legAngle); drawLeg(6, -legAngle); } else { drawLeg(-6, 20); drawLeg(6, -20); }
      ctx.fillStyle = player.color; ctx.fillRect(pX, pY, player.width, player.height - 5);
      ctx.fillStyle = '#0f172a'; const eyeX = player.direction === 'right' ? pX + 20 : pX + 5; ctx.fillRect(eyeX, pY + 12, 5, 5);
      const fWidth = 14; const fHeight = 6; const fHandX = player.direction === 'right' ? pX + player.width : pX - fWidth; const fHandY = pY + 28;
      ctx.fillStyle = '#334155'; ctx.fillRect(fHandX, fHandY, fWidth, fHeight);
      const gWidth = 18; const gHeight = 8; const recoilOffset = muzzleFlash * 3;
      const gHandX = player.direction === 'right' ? pX + player.width - 8 - recoilOffset : pX - gWidth + 8 + recoilOffset; const gHandY = pY + 36;
      ctx.fillStyle = '#1e293b'; ctx.fillRect(gHandX, gHandY, gWidth, gHeight);
      const barrelX = player.direction === 'right' ? gHandX + gWidth : gHandX - 12; ctx.fillStyle = '#0f172a'; ctx.fillRect(barrelX, gHandY + 1, 12, 4);
      const stockX = player.direction === 'right' ? gHandX - 6 : gHandX + gWidth; ctx.fillRect(stockX, gHandY, 6, 12);

      // --- LIGHTING LAYER ---
      lctx.globalCompositeOperation = 'source-over';
      lctx.fillStyle = '#000000';
      lctx.fillRect(0, 0, lCanvas.width, lCanvas.height);
      lctx.globalCompositeOperation = 'destination-out';

      if (lightningIntensity > 0) {
        lctx.fillStyle = `rgba(255, 255, 255, ${lightningIntensity * 0.95})`;
        lctx.fillRect(0, 0, lCanvas.width, lCanvas.height);
      }

      lamps.forEach(lamp => {
        const screenX = lamp.x - worldOffset; const lampY = groundY - 210;
        if (screenX < -lamp.range || screenX > canvas.width + lamp.range) return;
        const gradient = lctx.createRadialGradient(screenX, lampY, 0, screenX, lampY, lamp.range);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${lamp.intensity / 0.9})`);
        gradient.addColorStop(0.4, `rgba(255, 255, 255, ${(lamp.intensity / 0.9) * 0.7})`);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        lctx.fillStyle = gradient; lctx.beginPath(); lctx.arc(screenX, lampY, lamp.range, 0, Math.PI * 2); lctx.fill();
      });

      if (player.isFlashlightOn) {
        const beamOriginX = player.direction === 'right' ? fHandX + fWidth : fHandX; const beamOriginY = fHandY + fHeight / 2;
        const spillGrad = lctx.createRadialGradient(beamOriginX, beamOriginY, 0, beamOriginX, beamOriginY, 50);
        spillGrad.addColorStop(0, 'rgba(255, 255, 255, 0.5)'); spillGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        lctx.fillStyle = spillGrad; lctx.beginPath(); lctx.arc(beamOriginX, beamOriginY, 50, 0, Math.PI * 2); lctx.fill();
        
        const beamLength = 350; 
        const beamEndHalfWidth = 150; 
        const beamStartHalfWidth = 5; 
        const dirF = player.direction === 'right' ? 1 : -1;
        
        const flGrad = lctx.createRadialGradient(beamOriginX, beamOriginY, 0, beamOriginX, beamOriginY, beamLength);
        flGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)'); flGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        lctx.fillStyle = flGrad; 
        
        lctx.beginPath();
        lctx.moveTo(beamOriginX, beamOriginY - beamStartHalfWidth);
        lctx.lineTo(beamOriginX + beamLength * dirF, beamOriginY - beamEndHalfWidth);
        lctx.lineTo(beamOriginX + beamLength * dirF, beamOriginY + beamEndHalfWidth);
        lctx.lineTo(beamOriginX, beamOriginY + beamStartHalfWidth);
        lctx.closePath(); 
        lctx.fill();
      }

      if (muzzleFlash > 0) {
        const flashX = player.direction === 'right' ? barrelX + 12 : barrelX; const flashY = gHandY + 3;
        const flashRadius = 380 * muzzleFlash; const flashGrad = lctx.createRadialGradient(flashX, flashY, 0, flashX, flashY, flashRadius);
        flashGrad.addColorStop(0, `rgba(255, 255, 255, ${muzzleFlash})`); flashGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        lctx.fillStyle = flashGrad; lctx.beginPath(); lctx.arc(flashX, flashY, flashRadius, 0, Math.PI * 2); lctx.fill();
      }

      if (lCanvas.width > 0 && lCanvas.height > 0) {
        ctx.drawImage(lCanvas, 0, 0);
      }

      // --- INDEPENDENT WINDOW LIGHTING ---
      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = 'rgba(255, 255, 240, 0.08)';
      for (let i = -5; i < 25; i++) {
        const bW = 180;
        const bH = 220 + (Math.abs(i * 137) % 100); 
        const x = (i * 350) - (worldOffset * parallaxFactor); 
        const bY = groundY - bH;
        if (x + bW < 0 || x > canvas.width) continue;
        
        const winW = 12; const winH = 18; const padding = 25; const gapX = 35; const gapY = 45; const cols = 4;
        const rows = Math.floor((bH - 60) / gapY);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const winX = x + padding + c * gapX;
            const winY = bY + 40 + r * gapY;
            
            // PREVENT WINDOWS FROM SHOWING BEHIND BILLBOARD (Updated for new location)
            const isInsideBillboard = 
                winX > billboardScreenX - 5 && 
                winX < billboardScreenX + bBoardWidth + 5 && 
                winY > bBoardTopY - 5 && 
                winY < bBoardTopY + bBoardHeight + 125; 

            if (!isInsideBillboard && (i + r * 3 + c) % 5 !== 0) {
              ctx.fillRect(winX, winY, winW, winH);
            }
          }
        }
      }
      ctx.restore();

      // --- RAIN RENDERING ---
      rain.forEach(r => {
        const sx = r.x; const sy = r.y; let lightVal = 0.1 + lightningIntensity * 0.4;
        lamps.forEach(lamp => {
          const ldx = (lamp.x - worldOffset) - sx; const ldy = (groundY - 210) - sy;
          const dist = Math.sqrt(ldx * ldx + ldy * ldy);
          if (dist < lamp.range) lightVal = Math.max(lightVal, (1 - dist / lamp.range) * (lamp.intensity / 0.9));
        });
        if (player.isFlashlightOn) {
          const beamOriginX = player.direction === 'right' ? fHandX + fWidth : fHandX; const beamOriginY = fHandY + fHeight / 2;
          const dx = sx - beamOriginX; const dy = sy - beamOriginY; const dist = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx); const dirF = player.direction === 'right' ? 0 : Math.PI;
          const angleDiff = Math.abs(angle - dirF);
          if (dist < 350 && (angleDiff < 0.5 || angleDiff > Math.PI * 2 - 0.5)) lightVal = Math.max(lightVal, (1 - dist / 350) * 0.8);
        }
        const alpha = 0.05 + lightVal * 0.4; const brightness = 100 + lightVal * 155;
        ctx.strokeStyle = `rgba(${brightness}, ${brightness}, ${brightness + 20}, ${alpha})`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx - 2, sy + r.len); ctx.stroke();
      });

      coins.forEach(coin => {
          const screenX = coin.x - worldOffset; if (screenX < -20 || screenX > canvas.width + 20) return;
          const coinY = groundY + coin.y - 10; const spin = Math.abs(Math.sin(animationTime.current * 2)); const pulse = 1 + Math.sin(animationTime.current * 3) * 0.2;
          ctx.save(); ctx.translate(screenX, coinY); ctx.scale(spin, 1); ctx.fillStyle = '#fbbf24'; ctx.shadowBlur = 10; ctx.shadowColor = 'rgba(251, 191, 36, 0.8)';
          ctx.beginPath(); ctx.arc(0, 0, 6 * pulse, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#b45309'; ctx.lineWidth = 1; ctx.stroke(); ctx.restore();
      });

      collectingCoins.forEach(c => {
          ctx.save(); ctx.translate(c.screenPos.x, c.screenPos.y); const spin = Math.abs(Math.sin(animationTime.current * 4)); ctx.scale(spin, 1);
          ctx.fillStyle = '#fbbf24'; ctx.shadowBlur = 15; ctx.shadowColor = 'rgba(251, 191, 36, 0.8)';
          ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#b45309'; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
      });

      ctx.globalCompositeOperation = 'screen';
      if (lightningIntensity > 0) { ctx.fillStyle = `rgba(200, 230, 255, ${lightningIntensity * 0.2})`; ctx.fillRect(0, 0, canvas.width, canvas.height); }
      if (muzzleFlash > 0) {
        const flashX = player.direction === 'right' ? barrelX + 12 : barrelX; const flashY = gHandY + 3; const flashRadius = 120 * muzzleFlash;
        const orangeGlow = ctx.createRadialGradient(flashX, flashY, 0, flashX, flashY, flashRadius);
        orangeGlow.addColorStop(0, `rgba(255, 190, 80, ${muzzleFlash * 0.95})`); orangeGlow.addColorStop(0.4, `rgba(255, 140, 20, ${muzzleFlash * 0.6})`); orangeGlow.addColorStop(1, 'rgba(255, 60, 0, 0)');
        ctx.fillStyle = orangeGlow; ctx.beginPath(); ctx.arc(flashX, flashY, flashRadius, 0, Math.PI * 2); ctx.fill();
        const baseAngle = player.direction === 'right' ? 0 : Math.PI; const colors = [`rgba(255, 255, 220, ${muzzleFlash})`, `rgba(255, 240, 100, ${muzzleFlash * 0.9})`];
        drawMuzzleSpike(flashX, flashY, baseAngle, 50 * muzzleFlash, 15, colors[0]);
        for(let i = 0; i < 5; i++) {
          const angle = baseAngle + (Math.random() - 0.5) * 1.2; const len = (30 + Math.random() * 40) * muzzleFlash; const width = (5 + Math.random() * 7) * muzzleFlash;
          drawMuzzleSpike(flashX, flashY, angle, len, width, colors[i % 2]);
        }
      }

      if (player.isFlashlightOn) {
        const beamOriginX = player.direction === 'right' ? fHandX + fWidth : fHandX; const beamOriginY = fHandY + fHeight / 2; const dirF = player.direction === 'right' ? 1 : -1;
        const beamLength = 300;
        const beamEndHalfWidth = 150; 
        const beamStartHalfWidth = 5; 
        
        const fHaze = ctx.createLinearGradient(beamOriginX, beamOriginY, beamOriginX + beamLength * dirF, beamOriginY);
        fHaze.addColorStop(0, 'rgba(255, 255, 255, 0.08)'); fHaze.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = fHaze; 
        
        ctx.beginPath(); 
        ctx.moveTo(beamOriginX, beamOriginY - beamStartHalfWidth);
        ctx.lineTo(beamOriginX + beamLength * dirF, beamOriginY - beamEndHalfWidth);
        ctx.lineTo(beamOriginX + beamLength * dirF, beamOriginY + beamEndHalfWidth);
        ctx.lineTo(beamOriginX, beamOriginY + beamStartHalfWidth);
        ctx.closePath(); 
        ctx.fill();
      }

      lamps.forEach(lamp => {
        const screenX = lamp.x - worldOffset; const lampY = groundY - 210;
        if (screenX < -lamp.range || screenX > canvas.width + lamp.range) return;
        if (lamp.intensity > 0.1) {
          const beamGradient = ctx.createLinearGradient(screenX, lampY, screenX, groundY); const alphaFactor = lamp.intensity / 0.9;
          beamGradient.addColorStop(0, `rgba(255, 247, 237, ${0.12 * alphaFactor})`); beamGradient.addColorStop(1, 'rgba(255, 247, 237, 0)');
          ctx.fillStyle = beamGradient; ctx.beginPath(); ctx.moveTo(screenX - 20, lampY); ctx.lineTo(screenX + 20, lampY); ctx.lineTo(screenX + 120, groundY); ctx.lineTo(screenX - 120, groundY); ctx.closePath(); ctx.fill();
        }
      });

      ctx.globalCompositeOperation = 'source-over';
      floatingTexts.forEach(ft => {
        const screenX = ft.x - worldOffset; ctx.save(); ctx.globalAlpha = ft.opacity; ctx.fillStyle = ft.color || '#ff1a1a';
        ctx.shadowBlur = 8; ctx.shadowColor = ft.color || 'rgba(255, 0, 0, 0.8)'; ctx.font = 'bold 32px "Creepster", cursive'; ctx.textAlign = 'center'; ctx.fillText(ft.text, screenX, groundY + ft.y); ctx.restore();
      });
    };

    let animationId = requestAnimationFrame(function loop() { draw(); animationId = requestAnimationFrame(loop); });
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animationId); };
  }, [gameState]);

  return <canvas ref={canvasRef} className="absolute inset-0" />;
};

export default GameCanvas;
