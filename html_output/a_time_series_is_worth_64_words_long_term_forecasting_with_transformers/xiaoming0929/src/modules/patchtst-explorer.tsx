import React, { useEffect, useMemo, useRef, useState } from 'react';
import { setupCanvas, observeCanvas, clamp, map, lerp } from '../lib/canvasKit';
import type { WidgetProps } from './registry';

const BLUE = '#27446e';
const GREEN = '#228d5c';
const RED = '#c43f52';
const ORANGE = '#f07e47';
const PURPLE = '#7c3aed';
const INK = '#21324a';
const MUTED = '#68778f';
const PAPER = '#f5f8f0';
const W = 1080;
const H = 280;

type Feedback = { text: string; cls: '' | 'good' | 'bad' };

function drawScore(ctx: CanvasRenderingContext2D, w: number, h: number, selected = 0.55, tone = BLUE) {
  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#b8c9a7';
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i += 1) {
    const y = 70 + i * 24;
    ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(w - 30, y); ctx.stroke();
  }
  ctx.strokeStyle = '#d7deea';
  for (let i = 0; i < 9; i += 1) {
    const x = 60 + i * ((w - 120) / 8);
    ctx.beginPath(); ctx.moveTo(x, 55); ctx.lineTo(x, 180); ctx.stroke();
  }
  ctx.strokeStyle = tone;
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let i = 0; i <= 80; i += 1) {
    const x = 40 + (w - 80) * (i / 80);
    const y = 128 + Math.sin(i * 0.35) * 24 + Math.sin(i * 0.09) * 12;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  const x = clamp(selected, 0.04, 0.96) * w;
  ctx.fillStyle = tone;
  ctx.beginPath(); ctx.arc(x, 128 + Math.sin(selected * 25) * 18, 12, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = GREEN;
  ctx.beginPath(); ctx.arc(w - 70, 92, 10, 0, Math.PI * 2); ctx.fill();
}

function drawBaton(ctx: CanvasRenderingContext2D, w: number, h: number, phase: number, tone = BLUE) {
  const x = 70 + ((phase % 1) * (w - 140));
  ctx.strokeStyle = '#92400e'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(x - 30, 35); ctx.lineTo(x + 16, 155); ctx.stroke();
  ctx.fillStyle = tone; ctx.beginPath(); ctx.arc(x + 18, 160, 9, 0, Math.PI * 2); ctx.fill();
}

function drawBars(ctx: CanvasRenderingContext2D, values: number[], labels: string[], colors: string[]) {
  const max = Math.max(...values, 0.01);
  values.forEach((v, i) => {
    const x = 90 + i * 210;
    const height = 150 * (v / max);
    ctx.fillStyle = colors[i] || BLUE;
    ctx.fillRect(x, 220 - height, 90, height);
    ctx.fillStyle = INK; ctx.font = '20px Segoe UI'; ctx.fillText(v.toFixed(3), x, 250);
    ctx.fillStyle = MUTED; ctx.font = '16px Segoe UI'; ctx.fillText(labels[i] || '', x, 272);
  });
}

function useAnimatedCanvas(canvasRef: React.RefObject<HTMLCanvasElement>, render: (ctx: CanvasRenderingContext2D, t: number) => void, width = W, height = H) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let ctx: CanvasRenderingContext2D;
    try { ctx = setupCanvas(canvas, width, height); } catch { return; }
    let raf: number | null = null;
    const started = performance.now();
    const tick = (now: number) => {
      render(ctx, (now - started) / 2400);
      if (!canvas.classList.contains('is-ready')) canvas.classList.add('is-ready');
      raf = requestAnimationFrame(tick);
    };
    const start = () => { if (!raf) raf = requestAnimationFrame(tick); };
    const stop = () => { if (raf) cancelAnimationFrame(raf); raf = null; };
    const disconnect = observeCanvas(canvas, start, stop);
    return () => { stop(); disconnect(); };
  }, [canvasRef, render, width, height]);
}

export const PatchTSTExplorer: React.FC<WidgetProps> = ({ chapterId, moduleId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lookback, setLookback] = useState(336);
  const [patchLength, setPatchLength] = useState(16);
  const [stride, setStride] = useState(8);
  const [repair, setRepair] = useState(false);
  const [started, setStarted] = useState(false);
  const [stage, setStage] = useState(0);
  const [step, setStep] = useState(0);
  const [maskRatio, setMaskRatio] = useState(0.4);
  const [selected, setSelected] = useState('patch');
  const [head, setHead] = useState('forecast');
  const [variant, setVariant] = useState('P+CI');
  const [dataset, setDataset] = useState('Traffic');
  const [protocol, setProtocol] = useState('traffic');
  const [feedback, setFeedback] = useState<Feedback>({ text: '操作画面中的一个控制，观察状态和反馈同步变化。', cls: '' });

  const isAnalogy = moduleId === 'ana';
  const isHero = moduleId === 'old' || moduleId === 'new';
  const patchCount = Math.max(2, Math.floor((lookback - patchLength) / stride) + 2);

  const render = useMemo(() => (ctx: CanvasRenderingContext2D, t: number) => {
    const small = isAnalogy || isHero;
    const w = small ? 560 : W;
    const h = small ? 140 : H;
    ctx.clearRect(0, 0, w, h);
    if (small) {
      const tone = isHero && moduleId === 'old' ? RED : GREEN;
      drawScore(ctx, w, h, (t % 1), tone);
      drawBaton(ctx, w, h, t % 1, tone);
      return;
    }
    drawScore(ctx, w, h, 0.1 + ((patchCount % 40) / 45), BLUE);
    ctx.fillStyle = INK; ctx.font = '18px Segoe UI';
    const chapter = Number(chapterId.replace('chap-', ''));
    if (chapter === 1) {
      const cost = (lookback / (repair ? 16 : 96)) ** 2;
      ctx.strokeStyle = repair ? GREEN : RED; ctx.lineWidth = 4; ctx.beginPath();
      for (let i = 0; i < 80; i += 1) { const x = 40 + i * 12; const y = 220 - Math.min(170, (cost / 16) * (i / 80) * 150 + 20); if (!i) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
      ctx.stroke(); ctx.fillStyle = repair ? GREEN : RED; ctx.fillText(`N ${repair ? patchCount : lookback}`, 50, 35);
    } else if (chapter === 2) {
      ctx.strokeStyle = ORANGE; ctx.lineWidth = 6; const x = 100 + (patchLength / 32) * 760;
      ctx.strokeRect(x, 80, Math.max(80, patchLength * 12), 70); ctx.fillStyle = INK; ctx.fillText(`N ${patchCount}`, 70, 35);
    } else if (chapter === 3) {
      const tone = started ? GREEN : RED; ctx.strokeStyle = tone; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(120, 210); ctx.quadraticCurveTo(450, started ? 120 : 245, 900, 90); ctx.stroke(); ctx.fillStyle = tone; ctx.fillText(started ? '共享骨干' : '混合输入', 90, 35);
    } else if (chapter === 4) {
      const cost = patchCount * patchCount / 1764; drawBars(ctx, [lookback / 720, patchCount / 42, cost], ['L', 'N', 'N²'], [BLUE, ORANGE, cost > 1.2 ? RED : GREEN]);
    } else if (chapter === 5) {
      const xs = [140, 380, 620]; for (let i = 0; i < 3; i += 1) { ctx.fillStyle = i === stage ? PURPLE : '#b8c9a7'; ctx.fillRect(xs[i], 90, 160, 70); }
      ctx.fillStyle = INK; ctx.fillText(['投影 P→D', '位置 D×N', '注意力'][stage], 150, 190);
    } else if (chapter === 6) {
      const labels = ['归一化', '补丁', '编码', '展平', '预测']; const x = 90 + step * 210; ctx.strokeStyle = BLUE; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(80, 150); ctx.lineTo(x, 150); ctx.stroke(); ctx.fillStyle = GREEN; ctx.beginPath(); ctx.arc(x, 150, 18, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = INK; ctx.fillText(labels[step], 80, 55); ctx.fillText(`${step + 1}/5`, 930, 55);
    } else if (chapter === 7) {
      const n = 42; for (let i = 0; i < n; i += 1) { const x = 60 + (i % 14) * 68; const y = 80 + Math.floor(i / 14) * 35; const masked = i / n < maskRatio; ctx.fillStyle = masked ? RED : GREEN; ctx.globalAlpha = masked && !started ? 0.75 : 1; ctx.fillRect(x, y, 48, 20); ctx.globalAlpha = 1; }
      ctx.fillStyle = INK; ctx.fillText(`mask ${(maskRatio * 100).toFixed(0)}%`, 60, 245);
    } else if (chapter === 8) {
      const names = ['Norm', 'Patch', 'Embed', 'Attn', 'Head']; const xs = [80, 270, 460, 650, 840]; names.forEach((name, i) => { ctx.strokeStyle = name.toLowerCase() === selected ? PURPLE : '#d7deea'; ctx.lineWidth = name.toLowerCase() === selected ? 7 : 2; ctx.strokeRect(xs[i], 110, 110, 60); ctx.fillStyle = INK; ctx.fillText(name, xs[i] + 15, 145); if (i < 4) { ctx.strokeStyle = BLUE; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(xs[i] + 110, 140); ctx.lineTo(xs[i + 1], 140); ctx.stroke(); } }); ctx.fillStyle = GREEN; ctx.fillText(head === 'forecast' ? '1×T' : 'D×P', 870, 90);
    } else if (chapter === 9) {
      const values: Record<string, Record<string, number>> = { Traffic: { 'P+CI': 0.367, CI: 0.397, P: 0.595, Original: 0.576 }, Weather: { 'P+CI': 0.152, CI: 0.164, P: 0.168, Original: 0.238 }, Electricity: { 'P+CI': 0.130, CI: 0.136, P: 0.196, Original: 0.186 } };
      const row = values[dataset]; drawBars(ctx, [row['P+CI'], row.CI, row.P, row.Original], ['P+CI', 'CI', 'P', 'Orig'], [GREEN, BLUE, RED, RED]);
    } else {
      const values = protocol === 'traffic' ? [0.360, 0.410, 0.576] : [0.472, 0.864, 0.907];
      drawBars(ctx, values, protocol === 'traffic' ? ['P/64', 'DLinear', 'FED'] : ['Transferred', 'BTSF', 'TS2Vec'], [GREEN, BLUE, RED]);
    }
  }, [chapterId, moduleId, isAnalogy, isHero, lookback, patchLength, stride, repair, started, stage, step, maskRatio, selected, head, variant, dataset, protocol, patchCount]);

  useAnimatedCanvas(canvasRef, render, isAnalogy || isHero ? 560 : W, isAnalogy || isHero ? 140 : H);

  if (isAnalogy || isHero) return <canvas ref={canvasRef} width={isAnalogy || isHero ? 560 : W} height={isAnalogy || isHero ? 140 : H} />;

  const chapter = Number(chapterId.replace('chap-', ''));
  const common = (text: string, cls: Feedback['cls'] = '') => setFeedback({ text, cls });
  const controls = (() => {
    if (chapter === 1) return <div className="ctrl"><label>回看 L <span className="val">{lookback}</span></label><input type="range" min="96" max="720" step="24" value={lookback} onChange={(e) => { const v = Number(e.target.value); setLookback(v); common(repair ? '补丁化后仍能保留更长历史。' : '逐点 token 随 L 增长，注意力二次项变重。', repair ? 'good' : 'bad'); }} /><button onClick={() => { setRepair(!repair); common(!repair ? '绿色：patch 缩短 token，同时保留局部乐句。' : '红色：回到逐点 token，长窗口开销重新出现。', !repair ? 'good' : 'bad'); }}>{repair ? '关闭 Patch' : '启用 Patch'}</button></div>;
    if (chapter === 2) return <div className="ctrl"><label>补丁 P <span className="val">{patchLength}</span></label><input type="range" min="4" max="32" step="4" value={patchLength} onChange={(e) => { const v = Number(e.target.value); setPatchLength(v); common(v < 8 ? '红色：补丁太短，局部语义仍接近逐点。' : '蓝色：括号正在收集一个局部乐句。', v < 8 ? 'bad' : ''); }} /><label>步长 S</label><select value={stride} onChange={(e) => { setStride(Number(e.target.value)); common('步长改变了重叠与 token 数。'); }}><option value={4}>4</option><option value={8}>8</option><option value={16}>16</option></select><span className="val">N={patchCount}</span></div>;
    if (chapter === 3) return <div className="ctrl"><button onClick={() => { setStarted(!started); common(!started ? '绿色：两条通道独立前向，共享同一骨干。' : '红色：混合 token 把不同声部挤在一起。', !started ? 'good' : 'bad'); }}>{started ? '切回混合' : '开始独立对比'}</button><span className="val">{started ? 'shared weights' : 'mixed token'}</span></div>;
    if (chapter === 4) return <div className="ctrl"><label>L <span className="val">{lookback}</span></label><input type="range" min="96" max="720" step="24" value={lookback} onChange={(e) => { setLookback(Number(e.target.value)); common('蓝色：回看更远，但 N² 曲线由 P 和 S 共同约束。'); }} /><label>P</label><select value={patchLength} onChange={(e) => { setPatchLength(Number(e.target.value)); common('橙色：改变局部粒度。'); }}><option value={8}>8</option><option value={16}>16</option><option value={32}>32</option></select><label>S</label><select value={stride} onChange={(e) => { setStride(Number(e.target.value)); common('橙色：改变 token 数。'); }}><option value={4}>4</option><option value={8}>8</option><option value={16}>16</option></select></div>;
    if (chapter === 5) return <div className="ctrl">{['projection', 'position', 'attention'].map((x, i) => <button key={x} className={stage === i ? 'active' : ''} onClick={() => { setStage(i); common(['投影把 P 维 patch 送入 D 维。', '位置编码保留每个 patch 的时间位置。', '带位置的 token 才进入注意力。'][i], i === 2 ? 'good' : ''); }}>{['投影', '位置', '注意力'][i]}</button>)}</div>;
    if (chapter === 6) return <div className="ctrl"><button onClick={() => setStep(Math.max(0, step - 1))}>上一步</button><button onClick={() => { const v = Math.min(4, step + 1); setStep(v); common(v === 4 ? '绿色：线性头输出未来 T 步。' : '蓝色：沿着同一条前向路线继续。', v === 4 ? 'good' : ''); }}>下一步</button><button onClick={() => setStep(0)}>重置</button><span className="val">{step + 1}/5</span></div>;
    if (chapter === 7) return <div className="ctrl"><label>遮罩比例 <span className="val">{Math.round(maskRatio * 100)}%</span></label><input type="range" min="0" max="60" value={Math.round(maskRatio * 100)} onChange={(e) => { const v = Number(e.target.value) / 100; setMaskRatio(v); common(v < 0.15 ? '红色：遮罩太少，模型容易靠邻点猜。' : v < 0.3 ? '蓝色：正在增加重建压力。' : '绿色：补丁级缺口迫使模型利用整体节奏。', v < 0.15 ? 'bad' : v >= 0.3 ? 'good' : ''); }} /><button onClick={() => { setStarted(true); common('绿色：只在被遮补丁上计算重建误差。', 'good'); }}>重建</button></div>;
    if (chapter === 8) return <div className="ctrl"><span className="chip-row">{['norm', 'patch', 'embed', 'attn', 'head'].map(x => <button key={x} className={selected === x ? 'active' : ''} onClick={() => { setSelected(x); common(`已选 ${x}：活动路径和张量形状同步更新。`, x === 'head' ? 'good' : ''); }}>{x}</button>)}</span><select value={head} onChange={(e) => { setHead(e.target.value); common(e.target.value === 'forecast' ? '预测出口输出 1×T。' : '重建出口输出 D×P。', 'good'); }}><option value="forecast">forecast</option><option value="reconstruct">reconstruct</option></select></div>;
    if (chapter === 9) return <div className="ctrl"><span className="chip-row">{['Traffic', 'Weather', 'Electricity'].map(x => <button key={x} className={dataset === x ? 'active' : ''} onClick={() => { setDataset(x); common(`${x} · horizon=96 · MSE 越低越好。`); }}>{x}</button>)}</span><span className="chip-row">{['P+CI', 'CI', 'P', 'Original'].map(x => <button key={x} className={variant === x ? 'active' : ''} onClick={() => { setVariant(x); common(`${x} 的 Table 7 值已高亮；不要跨协议比较。`, x === 'P+CI' ? 'good' : ''); }}>{x}</button>)}</span></div>;
    return <div className="ctrl"><span className="chip-row"><button className={protocol === 'traffic' ? 'active' : ''} onClick={() => { setProtocol('traffic'); common('Traffic-96 supervised：MSE 越低越好。'); }}>Traffic-96</button><button className={protocol === 'etth1' ? 'active' : ''} onClick={() => { setProtocol('etth1'); common('ETTh1-336 transferred：先在 Traffic 预训练。'); }}>ETTh1-336</button></span><button onClick={() => { setStarted(true); common('绿色：在同一协议下，PatchTST 的柱更短。', 'good'); }}>开始比较</button></div>;
  })();

  return <div><canvas ref={canvasRef} width={W} height={H} />{controls}<div className={`feedback ${feedback.cls}`}>{feedback.text}</div></div>;
};

export default PatchTSTExplorer;
