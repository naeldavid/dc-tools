# HypeSquad Badge Scripts

## Add a badge

```javascript
let wreq = webpackChunkdiscord_app.push([[Symbol()],{},r=>r]);
webpackChunkdiscord_app.pop();
const chunks = Object.entries(wreq.m);
const findChunkByCode = (...codes) => {
    for (let i = 0; i < chunks.length; i++) {
        const [id,func] = chunks[i];
        const chunkCode = func.toString();
        if (codes.every(code=>chunkCode.includes(code))) return wreq(id);
    }
};
const api = Object.values(findChunkByCode("HTTPUtils")).find(e=>e?.get);

// Choose your house:
// House ID: 1 (Bravery - Red)
// House ID: 2 (Brilliance - Green)
// House ID: 3 (Balance - Blue)
api.post({url: "/hypesquad/online", body: {house_id: 1-2-3}});
```

## Remove Badge

```javascript
// Remove HypeSquad Badge Script
let wreq = webpackChunkdiscord_app.push([[Symbol()],{},r=>r]);
webpackChunkdiscord_app.pop();
const chunks = Object.entries(wreq.m);
const findChunkByCode = (...codes) => {
    for (let i = 0; i < chunks.length; i++) {
        const [id,func] = chunks[i];
        const chunkCode = func.toString();
        if (codes.every(code=>chunkCode.includes(code))) return wreq(id);
    }
};

const api = Object.values(findChunkByCode("HTTPUtils")).find(e=>e?.get);

api.delete({url: "/hypesquad/online"});

console.log("HypeSquad badge removed! Refresh Discord.");
```
