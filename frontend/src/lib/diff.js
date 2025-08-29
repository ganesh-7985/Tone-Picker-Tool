export function wordDiff(a, b) {
    const A = a.split(/(\s+)/);
    const B = b.split(/(\s+)/);
    const m = A.length, n = B.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = m - 1; i >= 0; i--) {
      for (let j = n - 1; j >= 0; j--) {
        dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    const out = [];
    let i = 0, j = 0;
    while (i < m && j < n) {
      if (A[i] === B[j]) { out.push({ text: A[i], type: 'same' }); i++; j++; }
      else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ text: A[i], type: 'del' }); i++; }
      else { out.push({ text: B[j], type: 'add' }); j++; }
    }
    while (i < m) out.push({ text: A[i++], type: 'del' });
    while (j < n) out.push({ text: B[j++], type: 'add' });
    return out;
  }
  