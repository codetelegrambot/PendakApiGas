function doGet(e) {
  // Mendefinisikan tanggal, bulan, dan tahun
  var nama = e.parameter.nama || '';
  var tgl = e.parameter.tgl || '';

  // URL target
  var url = 'https://pendak.nizamkomputer.com/ajax.php';

  // Data yang akan dikirimkan dalam request
  var data = {
    'nama': nama,
    'tanggal-meninggal': tgl
  };

  // Konversi data ke format URL-encoded
  var dataString = [];
  for (var key in data) {
    dataString.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
  }
  dataString = dataString.join('&');

  // Set opsi request
  var options = {
    'method': 'post',
    'payload': dataString,
    'muteHttpExceptions': true
  };

  // Eksekusi request dan simpan respon
  var response = UrlFetchApp.fetch(url, options).getContentText();

  // Parsing respon untuk mendapatkan informasi yang diinginkan
  var regex = /Almarhum <span class="font-weight-bold">(.*?)<\/span> sampai saat ini sudah meninggal selama <span class="font-weight-bold">(.*?)<\/span> hari./s;
  var matches = response.match(regex);
  
  var regex2 = /<th scope="row">(.*?)<\/th>\s+<td>(.*?)<\/td>\s+<td>(.*?)<\/td>\s+<td>(?:<del>(Lewat)<\/del>|(Belum))<\/td>/g;
  var matches2 = [];
  var match;
  while ((match = regex2.exec(response)) !== null) {
    matches2.push(match);
  }
  
  var regex3 = /<th[^>]*>([^<]+)<\/th>\s+<td>([^<]+)<\/td>\s+<td>([^<]+)<\/td>\s+<td>(?:<del>(Lewat)<\/del>|(Belum))<\/td>/g;
  var matches3 = [];
  while ((match = regex3.exec(response)) !== null) {
    matches3.push(match);
  }

  // Struktur data hasil parsing
  var result = {
    'nama': matches ? matches[1] : '',
    'jumlah_hari_meninggal': matches ? matches[2] : '',
    'ritual': []
  };

  // Proses data pengulangan ritual dari matches2
  matches2.forEach(function(match) {
    var hari_meninggal = match[3];
    var status = match[4] ? match[4] : match[5]; // Tentukan status berdasarkan hasil regex
    result['ritual'].push({
      'selamatan': match[1],
      'pasaran': match[2],
      'tanggal': hari_meninggal,
      'status': status
    });
  });

  // Proses data pengulangan ritual dari matches3
  matches3.forEach(function(match) {
    var hari_meninggal = match[3];
    var status = match[4] ? match[4] : match[5]; // Tentukan status berdasarkan hasil regex
    result['ritual'].push({
      'selamatan': match[1],
      'pasaran': match[2],
      'tanggal': hari_meninggal,
      'status': status
    });
  });

  // Mengambil hanya 8 entri pertama dari array 'ritual'
  result['ritual'] = result['ritual'].slice(0, 8);

  // Konversi hasil ke format JSON
  var jsonResult = JSON.stringify(result);

  // Tampilkan hasil
  return ContentService.createTextOutput(jsonResult).setMimeType(ContentService.MimeType.JSON);
}
