// Read a JSON array of IAST strings on stdin, write a JSON array of Devanagari strings.
import {Sanscript} from '../../lib/util/sanscript.mjs';
let buf='';
process.stdin.on('data',d=>buf+=d);
process.stdin.on('end',()=>{
  const arr=JSON.parse(buf);
  process.stdout.write(JSON.stringify(arr.map(s=>Sanscript.t(s,'iast','devanagari'))));
});
