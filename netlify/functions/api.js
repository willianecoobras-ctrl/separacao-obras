const { GoogleAuth } = require('google-auth-library');

const SPREADSHEET_ID = '1ul_jbE-CYF149-sv5y7mWhtKZikhnADA1bghr9hdQVQ';
const SHEET_NAME = 'AUX_PROGRAMAÇÃO';
const DADOS_SHEET = 'DADOS';

const CREDENTIALS = {
  type: 'service_account',
  project_id: 'eco-separacao-obras',
  client_email: 'eco-obras@eco-separacao-obras.iam.gserviceaccount.com',
  private_key_id: 'cacc6b63385269878050a26a38938c30951940f7',
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCxE3TjYdZuDmoq\nJ5YEtTz4ufYJ8MILbz1Bda1NWxiJf78aEtCKS7t3clYN91dawXBQQEjktCDjLS0R\n2lnVtRNzbZouAIr0rmxfg17JFSc36hkNLYHhutzz3HR5PyD+CjVyRuBAeShFJwTK\nvGKczC1vi9ebcvqotXkwWhO92O6JSJO3zMiJv//jrHN15uubZrYAp7usyZexDGTm\n3zPFcXYRk1DI4KEA4xojdNyqUdvjH6fiTnIBFqHw5aRJp/vX+nwlDPNrpRvKMadr\nSfiLa9fa78lR1jPDDQUcVglzkepffuoBrRdrCcF0dEn5ad4Nmk0OTC4LZHuOP3sf\n/67BC3AVAgMBAAECggEABJhH50eTEBzdJIti6+vaXBeSkBb4fgyh/F3F7wovBJBf\n9dio+Hxhw1t1lVwGnwMCe6lItZs2ouvO7dXqkK5ScHjBWwdmE6vRVu16gJbFLgEB\nKz5JTsFxztJ4uOsKW4qJxlWa/OlNQiAdUnfEH6P3sNuM2cqIa7zLxdVXNPeuVuRp\nYKCg+Ns8gglXnYnUInCnrC6MPmhiGPXzTU7LZuMWaCAOQq1fPBIbuRQ67QbMDzvI\nfMZ5TcdROCSIWoisfmbVFelMM9Xa88QPq2g/UXY8fcfdABLfcPFwa1e//696oTJV\nnO+yUFCNNnn1Z/1gDbQMGE/ppNmeg2k5xdqjU0bnKQKBgQDqx88PQMk5pjf27772\nBZbYxkJeiQaf97WpEk3ENg10El6MKm+0ABffFHBihpoyPtkEeBLs008TjoOWI57+\ntVhS7KBL79NVMu7bnqJieOgYvXCK/PT+Z/dUGOCypsdGKi4nA5CoFQeaVdSaYuiw\nC8kot41wln1JlZ0ard4ywZFIOQKBgQDBFIU3f+dNVKXNStcu1iKkcAqm0k1cNJ79\nRl8s2Fb607G0nUrKY2gLrJYOyxsKnsrgZgktzfURmHNRPYCMXzzwi1mbVTkjd1uR\nrzy76c+2OyMSoqA5fFI3H88bmT+pSZsOGD7LfN37dbVeR+UKq1stPd4lZnZQNkSj\n2V/q4YYOvQKBgQDDwPNIwXjF42xYLQ9oa8KZXbzqu49Vg6DopkVG6taOx94jOiLG\nzykYLB+EVrxsVnB1xHPrGEifgrz+Sxb/Qk6xXXBNwFnReNUlMoAsYKkML6+Ng1n2\nYNMcQF3hNyOBwhuXFebf7iDXsubADuX6GumPVHPOwvsVhnRmUT+pzDEJKQKBgGO2\n603MWnJPgwlQ22yu3lk6G+YnuhgifPGkxEZuvAzyA1aZ3SREzlkpGp4tOpvzgib9\ny0PCmAwsRXHxZ1AXZ2t7LB3Sl52/aKUGcUFC8SjVxbk8D69giz04ykcgkAYno1JW\nJygEJshU9APq8VjfQklNKEr8baHjRPOxsZ2mNwupAoGBAOUlR+IbxydRF8zl5Kay\nMqqzZ5q1f/fH2yzthVmJ3ezao8PADqlHQOSp9sEPQ7CNjBnjclGUZYc8IIp1i8kVJ\nS9ILxxtqQPmp0XFUoRpRPVjqpvUaB9AbpoOHdB61hJyuKi+95ldbeoD6QO4JqtIW\nyfyaUYqIWbqrp/j4YBTNj+7o\n-----END PRIVATE KEY-----\n",
};

async function getAccessToken() {
  const auth = new GoogleAuth({
    credentials: CREDENTIALS,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return token.token;
}

async function getSheetValues(token, sheetName, range) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(sheetName + '!' + range)}`;
  const resp = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const data = await resp.json();
  return data.values || [];
}

async function updateCell(token, sheetName, cell, value) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(sheetName + '!' + cell)}?valueInputOption=USER_ENTERED`;
  await fetch(url, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: [[value]] })
  });
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  const params = event.queryStringParameters || {};
  const action = params.action || '';
  try {
    const token = await getAccessToken();
    if (action === 'login') {
      const email = (params.email || '').trim().toLowerCase();
      const senha = (params.senha || '').trim();
      const rows = await getSheetValues(token, DADOS_SHEET, 'D2:F');
      for (let i = 0; i < rows.length; i++) {
        const emailPlan = (rows[i][0] || '').trim().toLowerCase();
        const senhaPad  = (rows[i][1] || '').trim();
        const senhaPers = (rows[i][2] || '').trim();
        if (emailPlan === email) {
          if (senhaPers === '') {
            return { statusCode: 200, headers, body: JSON.stringify({ status: senha === senhaPad ? 'primeiro_acesso' : 'unauthorized' }) };
          } else {
            return { statusCode: 200, headers, body: JSON.stringify({ status: senha === senhaPers ? 'ok' : 'unauthorized' }) };
          }
        }
      }
      return { statusCode: 200, headers, body: JSON.stringify({ status: 'unauthorized' }) };
    }
    if (action === 'trocarSenha') {
      const email     = (params.email || '').trim().toLowerCase();
      const novaSenha = (params.novaSenha || '').trim();
      const rows = await getSheetValues(token, DADOS_SHEET, 'D2:D');
      const idx = rows.findIndex(r => (r[0] || '').trim().toLowerCase() === email);
      if (idx === -1) return { statusCode: 200, headers, body: JSON.stringify({ status: 'error' }) };
      await updateCell(token, DADOS_SHEET, `F${idx + 2}`, novaSenha);
      return { statusCode: 200, headers, body: JSON.stringify({ status: 'ok' }) };
    }
    if (action === 'getSeparacao') {
      const dtInicio = params.dtInicio || '';
      const dtFim    = params.dtFim    || '';
      const base     = (params.base    || '').toUpperCase();
      const rows = await getSheetValues(token, SHEET_NAME, 'A2:E');
      const dI = dtInicio ? new Date(dtInicio + 'T00:00:00') : null;
      const dF = dtFim    ? new Date(dtFim    + 'T23:59:59') : null;
      const data = rows
        .filter(row => {
          if (!row[1]) return false;
          if (base && (row[3] || '').toUpperCase() !== base) return false;
          if (dI || dF) {
            const d = new Date(row[2]);
            if (isNaN(d)) return true;
            if (dI && d < dI) return false;
            if (dF && d > dF) return false;
          }
          return true;
        })
        .map(row => ({
          projeto:     row[0] || '',
          encarregado: row[1] || '',
          data:        row[2] ? new Date(row[2]).toLocaleDateString('pt-BR') : '',
          base:        row[3] || '',
          separacao:   row[4] || ''
        }));
      return { statusCode: 200, headers, body: JSON.stringify({ status: 'ok', data }) };
    }
    return { statusCode: 200, headers, body: JSON.stringify({ status: 'ok', message: 'Ecoelétrica API ativa' }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ status: 'error', message: err.message }) };
  }
};