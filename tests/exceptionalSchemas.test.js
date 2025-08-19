import { describe, it, expect } from 'vitest';
import { exceptionalRoleSchemas } from '@/components/admin/roles/ExceptionalUserSchemas';

describe('exceptionalRoleSchemas', () => {
  it('contains Mairie with required region/department/commune', () => {
    const mairie = exceptionalRoleSchemas.Mairie;
    const keys = mairie.map(f=>f.key);
    expect(keys).toContain('region');
    expect(keys).toContain('department');
    expect(keys).toContain('commune');
    const required = mairie.filter(f=>f.required).map(f=>f.key);
    expect(required).toEqual(expect.arrayContaining(['region','department','commune']));
  });

  it('Banque requires bank_name field', () => {
    const banque = exceptionalRoleSchemas.Banque;
    const bankField = banque.find(f=>f.key==='bank_name');
    expect(bankField).toBeTruthy();
    expect(bankField.required).toBe(true);
  });

  it('Administrateur has require_mfa optional checkbox', () => {
    const admin = exceptionalRoleSchemas.Administrateur;
    const f = admin.find(x=>x.key==='require_mfa');
    expect(f).toBeTruthy();
    expect(f.type).toBe('checkbox');
    expect(f.required).toBe(false);
  });
});
