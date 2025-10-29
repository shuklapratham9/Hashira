
const fs = require("fs");

function decodeValue(valueStr, base) {
  return BigInt(parseInt(valueStr, base));
}
function decodeBig(valueStr, base) {

  const digits = valueStr.toLowerCase();
  const alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
  let result = 0n;
  for (let ch of digits) {
    const digit = BigInt(alphabet.indexOf(ch));
    if (digit < 0n || digit >= BigInt(base))
      throw new Error(`Invalid digit '${ch}' for base ${base}`);
    result=result*BigInt(base);
  }
  return result;
}

function findConstantTerm(points,k) {

  const selected = points.slice(0, k);
  let sum = 0n;

  for (let i = 0; i < selected.length; i++) {
    const [xi, yi] = selected[i];
    let num = yi; 
    let den = 1n; 
    for (let j = 0; j < selected.length; j++) {
      if (i === j) continue;
      const [xj] = selected[j];
      num *= -xj;
      den *= xi - xj;
    }   
    sum += num / den;
  }
  return sum;
}
function computeSecretFromFile(filename) {
  const raw = fs.readFileSync(filename, "utf8");
  const data = JSON.parse(raw);
  const n = data.keys.n;
  const k = data.keys.k;

  const points = [];

  for (let key in data) {
    if (key === "keys") continue;
    const x = BigInt(key);
    const base = parseInt(data[key].base);
    const valueStr = data[key].value;
    const y = decodeBig(valueStr, base);
    points.push([x, y]);
  }

  points.sort((a, b)=>(a[0]<b[0]?-1:1));

  const secret = findConstantTerm(points, k);
  return secret;
}


try {
  const C1 = computeSecretFromFile("tc1.json");
  const C2 = computeSecretFromFile("tc2.json");

  console.log("C for testcase1.json =", C1.toString());
  console.log("C for testcase2.json =", C2.toString());
} catch (err) {
  console.error("Error:", err.message);
}
