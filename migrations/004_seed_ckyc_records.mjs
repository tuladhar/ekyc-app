// 004_seed_ckyc_records · inserts dummy CKYC records so the dashboard looks
// populated for the demo. Single multi-row INSERT (valid on both engines).

export function up() {
  return `
    INSERT INTO ekyc_applications
      (ckyc_number, full_name, document_type, document_number, email, phone, status)
    VALUES
      ('CKYC-10000001', 'Asha Sharma',    'Citizenship', '12-01-75-04567', 'asha.sharma@example.com',   '+977-9801010101', 'verified'),
      ('CKYC-10000002', 'Bikash Rai',     'Passport',    'PA1234567',       'bikash.rai@example.com',     '+977-9802020202', 'pending'),
      ('CKYC-10000003', 'Sita Gurung',    'National ID', 'NID-99887766',    'sita.gurung@example.com',    '+977-9803030303', 'verified'),
      ('CKYC-10000004', 'Ramesh Thapa',   'PAN',         'PAN-301122334',   'ramesh.thapa@example.com',   '+977-9804040404', 'rejected'),
      ('CKYC-10000005', 'Niraj Maharjan', 'Citizenship', '27-02-70-01234',  'niraj.maharjan@example.com', '+977-9805050505', 'pending')
  `;
}
