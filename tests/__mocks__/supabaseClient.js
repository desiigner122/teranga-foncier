export const supabase = {
  from(table){
    this._table = table;
    this._filters = [];
    this._order = null;
    this._range = null;
    return this;
  },
  select(sel, opts){ this._select = sel; this._count = opts?.count; return this; },
  eq(col,val){ this._filters.push(r=>String(r[col])===String(val)); return this; },
  gte(col,val){ this._filters.push(r=> new Date(r[col]) >= new Date(val)); return this; },
  lte(col,val){ this._filters.push(r=> new Date(r[col]) <= new Date(val)); return this; },
  order(col,{ascending}){ this._order = {col, ascending}; return this; },
  range(from,to){ this._range = {from,to}; return this; },
  async insert(rows){ return { data: rows.map((r,i)=>({ id:i+1, ...r })), error: null }; },
  async single(){ return { data: null, error: null }; },
  async selectExec(dataset){
    let rows = dataset;
    for(const f of this._filters) rows = rows.filter(f);
    if (this._order) rows = rows.sort((a,b)=> this._order.ascending ? (a[this._order.col]>b[this._order.col]?1:-1) : (a[this._order.col]<b[this._order.col]?1:-1));
    if (this._range) rows = rows.slice(this._range.from, this._range.to+1);
    return { data: rows, error: null, count: rows.length };
  }
};
