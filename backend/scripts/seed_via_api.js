const http = require('http');

const jobs = [
  { title: 'Store Promoter', company_name: 'QuickStaff', country: 'BR', city: 'Sao Paulo', salary: 'BRL 150 / day', job_type: 'Part-time', description: 'Looking for a reliable store promoter. Flexible hours.', requirements: ['Age 18+'], responsibilities: ['Follow instructions'], contact_platform: 'whatsapp', contact_label: 'Contact Now', contact_link: 'https://wa.me/5511999999000', tags: ['retail', 'parttime'], status: 'active', report_enabled: true },
  { title: 'Warehouse Helper', company_name: 'FastLogistics', country: 'BR', city: 'Rio de Janeiro', salary: 'BRL 170 / day', job_type: 'Part-time', description: 'Warehouse helper needed.', requirements: ['Age 18+'], responsibilities: ['Maintain punctuality'], contact_platform: 'whatsapp', contact_label: 'Contact Now', contact_link: 'https://wa.me/5511999999001', tags: ['warehouse', 'logistics'], status: 'active', report_enabled: true },
  { title: 'Warehouse Helper', company_name: 'FastLogistics', country: 'PH', city: 'Manila', salary: 'PHP 600 / day', job_type: 'Part-time', description: 'Reliable warehouse helper.', requirements: ['Age 18+'], responsibilities: ['Follow supervisor'], contact_platform: 'telegram', contact_label: 'Contact Now', contact_link: 'https://t.me/fastlogistics_bot', tags: ['warehouse', 'logistics'], status: 'active', report_enabled: true },
  { title: 'Food Delivery Rider', company_name: 'City Media', country: 'ID', city: 'Jakarta', salary: 'IDR 200K / day', job_type: 'Part-time', description: 'Delivery rider with flexible hours.', requirements: ['Age 18+'], responsibilities: ['Deliver on time'], contact_platform: 'whatsapp', contact_label: 'Contact Now', contact_link: 'https://wa.me/6281234567890', tags: ['delivery', 'rider'], status: 'active', report_enabled: true },
];

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({ hostname: 'localhost', port: 3000, path, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } }, (res) => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve(d));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function run() {
  for (const j of jobs) {
    await post('/api/admin/jobs', j);
    console.log('Seeded:', j.title, j.country);
  }
  await post('/api/admin/jobs', { title: 'Data Entry Clerk', company_name: 'BrightSolutions', country: 'PH', city: 'Cebu', salary: 'PHP 500 / day', job_type: 'Part-time', description: 'Data entry from home.', requirements: ['Computer literacy'], responsibilities: ['Enter data accurately'], contact_platform: 'telegram', contact_label: 'Contact Now', contact_link: 'https://t.me/bright_bot', tags: ['remote', 'entry'], status: 'active', report_enabled: true });
  console.log('Done');
}
run().catch(console.error);
