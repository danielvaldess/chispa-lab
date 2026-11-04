// Procesamiento de señales sin DOM: corre en el navegador y en Node (para pruebas).
(function (root) {
  'use strict';

  function mean(a) {
    var s = 0;
    for (var i = 0; i < a.length; i++) s += a[i];
    return a.length ? s / a.length : 0;
  }

  function std(a) {
    var m = mean(a), s = 0;
    for (var i = 0; i < a.length; i++) s += (a[i] - m) * (a[i] - m);
    return a.length ? Math.sqrt(s / a.length) : 0;
  }

  function median(a) {
    if (!a.length) return NaN;
    var b = a.slice().sort(function (x, y) { return x - y; });
    var h = b.length >> 1;
    return b.length % 2 ? b[h] : (b[h - 1] + b[h]) / 2;
  }

  // Remuestrea muestras {t, v} (t en segundos, irregular) a frecuencia fs fija.
  function resample(samples, fs) {
    if (samples.length < 2) return [];
    var t0 = samples[0].t, t1 = samples[samples.length - 1].t;
    var n = Math.floor((t1 - t0) * fs);
    var out = new Array(n), j = 0;
    for (var i = 0; i < n; i++) {
      var t = t0 + i / fs;
      while (j < samples.length - 2 && samples[j + 1].t < t) j++;
      var a = samples[j], b = samples[j + 1];
      var k = b.t === a.t ? 0 : (t - a.t) / (b.t - a.t);
      out[i] = a.v + (b.v - a.v) * k;
    }
    return out;
  }

  // Media móvil centrada con ventana w (los bordes usan la ventana disponible).
  function movingAverage(x, w) {
    var n = x.length, pre = new Array(n + 1), out = new Array(n), h = w >> 1;
    pre[0] = 0;
    for (var i = 0; i < n; i++) pre[i + 1] = pre[i] + x[i];
    for (var j = 0; j < n; j++) {
      var a = Math.max(0, j - h), b = Math.min(n, j + h + 1);
      out[j] = (pre[b] - pre[a]) / (b - a);
    }
    return out;
  }

  // Péndulo: con el celular colgado, |a| (con gravedad) tiene un máximo en cada paso por
  // el punto más bajo, es decir dos por período. El primer máximo de la autocorrelación
  // da medio período, y el período es el doble.
  function pendulumPeriod(samples) {
    var fs = 50;
    var x = resample(samples, fs);
    if (x.length < fs * 4) return null;
    var m = mean(x);
    x = x.map(function (v) { return v - m; });
    var r0 = 0, i;
    for (i = 0; i < x.length; i++) r0 += x[i] * x[i];
    if (r0 < 1e-9) return null;
    var minLag = Math.round(0.25 * fs);
    var maxLag = Math.min(Math.round(2.5 * fs), (x.length >> 1) - 1);
    var r = new Array(maxLag + 2);
    for (var lag = 0; lag <= maxLag + 1; lag++) {
      var s = 0;
      for (i = 0; i + lag < x.length; i++) s += x[i] * x[i + lag];
      r[lag] = s / r0;
    }
    for (lag = minLag + 1; lag <= maxLag; lag++) {
      if (r[lag] > 0.3 && r[lag] > r[lag - 1] && r[lag] >= r[lag + 1]) {
        var a = r[lag - 1], b = r[lag], c = r[lag + 1];
        var den = a - 2 * b + c;
        var p = den === 0 ? 0 : 0.5 * (a - c) / den;
        return { period: 2 * (lag + p) / fs, quality: r[lag] };
      }
    }
    return null;
  }

  // Pulso: canal rojo medio por fotograma con el dedo sobre la cámara.
  function heartRate(samples) {
    var fs = 30;
    var x = resample(samples, fs);
    if (x.length < fs * 8) return null;
    var base = movingAverage(x, Math.round(fs * 1.2));
    var y = x.map(function (v, i) { return v - base[i]; });
    y = movingAverage(y, 5);
    var sd = std(y);
    if (sd < 1e-6) return null;
    var minDist = Math.round(fs * 0.33), peaks = [], i;
    for (i = 2; i < y.length - 2; i++) {
      if (y[i] > 0.25 * sd && y[i] > y[i - 1] && y[i] >= y[i + 1] && y[i] > y[i - 2] && y[i] >= y[i + 2]) {
        if (peaks.length && i - peaks[peaks.length - 1] < minDist) {
          if (y[i] > y[peaks[peaks.length - 1]]) peaks[peaks.length - 1] = i;
        } else {
          peaks.push(i);
        }
      }
    }
    if (peaks.length < 4) return null;
    var iv = [];
    for (i = 1; i < peaks.length; i++) iv.push((peaks[i] - peaks[i - 1]) / fs);
    var med = median(iv);
    var good = iv.filter(function (d) { return Math.abs(d - med) <= 0.25 * med; });
    if (good.length < 3) return null;
    return { bpm: 60 / median(good), quality: good.length / iv.length, peaks: peaks.length };
  }

  // Frecuencia dominante de un espectro en dB (AnalyserNode), con interpolación parabólica.
  function dominantFreq(db, sampleRate, fftSize, minHz, maxHz) {
    var bin = sampleRate / fftSize;
    var i0 = Math.max(1, Math.ceil(minHz / bin)), i1 = Math.min(db.length - 2, Math.floor(maxHz / bin));
    var best = i0;
    for (var i = i0; i <= i1; i++) if (db[i] > db[best]) best = i;
    var a = db[best - 1], b = db[best], c = db[best + 1];
    var den = a - 2 * b + c;
    var p = den === 0 ? 0 : 0.5 * (a - c) / den;
    return { freq: (best + p) * bin, level: b };
  }

  // Regresión lineal y = m x + b, con coeficiente de correlación r.
  function fit(pts) {
    var n = pts.length;
    if (n < 2) return null;
    var mx = mean(pts.map(function (p) { return p.x; }));
    var my = mean(pts.map(function (p) { return p.y; }));
    var sxx = 0, sxy = 0, syy = 0;
    pts.forEach(function (p) {
      sxx += (p.x - mx) * (p.x - mx);
      sxy += (p.x - mx) * (p.y - my);
      syy += (p.y - my) * (p.y - my);
    });
    if (sxx === 0) return null;
    return { m: sxy / sxx, b: my - sxy / sxx * mx, r: syy === 0 ? 0 : sxy / Math.sqrt(sxx * syy) };
  }

  // g a partir de pares (L en cm, T en s): T² = (4π²/g) L, ajuste por el origen.
  function gravityFromPendulum(pts) {
    var num = 0, den = 0;
    pts.forEach(function (p) {
      var L = p.x / 100, T2 = p.y * p.y;
      num += L * T2;
      den += L * L;
    });
    return den === 0 || num === 0 ? null : 4 * Math.PI * Math.PI * den / num;
  }

  // Tono de la voz (algoritmo YIN simplificado) sobre una ventana en el tiempo.
  // Más robusto que el pico de la FFT, que salta a los armónicos.
  function pitchYIN(buf, sr, minHz, maxHz) {
    var n = buf.length, i, rms = 0;
    for (i = 0; i < n; i++) rms += buf[i] * buf[i];
    rms = Math.sqrt(rms / n);
    if (rms < 0.01) return null;
    var minLag = Math.max(2, Math.floor(sr / maxHz));
    var maxLag = Math.min(Math.floor(sr / minHz), (n >> 1) - 1);
    var w = n - maxLag, d = new Float32Array(maxLag + 1), cm = new Float32Array(maxLag + 1);
    for (var tau = 1; tau <= maxLag; tau++) {
      var s = 0;
      for (i = 0; i < w; i++) { var df = buf[i] - buf[i + tau]; s += df * df; }
      d[tau] = s;
    }
    var acc = 0;
    cm[0] = 1;
    for (tau = 1; tau <= maxLag; tau++) {
      acc += d[tau];
      cm[tau] = acc === 0 ? 1 : d[tau] * tau / acc;
    }
    for (tau = minLag; tau < maxLag; tau++) {
      if (cm[tau] < 0.15) {
        while (tau + 1 < maxLag && cm[tau + 1] < cm[tau]) tau++;
        var a = cm[tau - 1], b = cm[tau], c = cm[tau + 1];
        var den = a - 2 * b + c;
        var p = den === 0 ? 0 : 0.5 * (a - c) / den;
        return { freq: sr / (tau + p), clarity: 1 - b };
      }
    }
    return null;
  }

  var DSP = {
    mean: mean, std: std, median: median, resample: resample, movingAverage: movingAverage,
    pendulumPeriod: pendulumPeriod, heartRate: heartRate, dominantFreq: dominantFreq,
    fit: fit, gravityFromPendulum: gravityFromPendulum, pitchYIN: pitchYIN
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = DSP;
  else root.DSP = DSP;
})(typeof self !== 'undefined' ? self : this);
