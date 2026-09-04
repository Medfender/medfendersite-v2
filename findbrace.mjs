import ts from 'typescript';
import fs from 'fs';

const src = fs.readFileSync('src/components/audio/SSLConsole.tsx', 'utf8');
const sf = ts.createSourceFile('SSLConsole.tsx', src, ts.ScriptTarget.ES2020, true, ts.ScriptKind.TSX);

let braceStack = [];
let errors = [];

function walk(node) {
    const kind = node.kind;
    if (kind === ts.SyntaxKind.OpenBraceToken || kind === ts.SyntaxKind.CloseBraceToken ||
        kind === ts.SyntaxKind.OpenParenToken || kind === ts.SyntaxKind.CloseParenToken) {
        const isOpen = kind === ts.SyntaxKind.OpenBraceToken || kind === ts.SyntaxKind.OpenParenToken;
        if (isOpen) {
            braceStack.push({pos: node.pos, end: node.end, kind: ts.SyntaxKind[kind]});
        } else {
            if (braceStack.length === 0) {
                errors.push(`Extra closing at pos ${node.pos} line ${sf.getLineAndCharacterOfPosition(node.pos).line + 1}`);
            } else {
                braceStack.pop();
            }
        }
    }
    ts.forEachChild(node, walk);
}

walk(sf);

if (errors.length) {
    errors.forEach(e => console.log('ERROR:', e));
} else {
    console.log(`Remaining unclosed: ${braceStack.length}`);
    braceStack.forEach(b => {
        const line = sf.getLineAndCharacterOfPosition(b.pos).line + 1;
        const col = sf.getLineAndCharacterOfPosition(b.pos).character;
        console.log(`  Unclosed ${b.kind} at line ${line}:${col} -- "${sf.text.slice(Math.max(0,b.pos-15), b.pos+15)}"`);
    });
}
