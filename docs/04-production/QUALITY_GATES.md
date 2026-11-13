# Quality Gates

Status dicatat terpisah dan tidak boleh digabung.

| Status | Bukti yang dibutuhkan |
| --- | --- |
| SPECIFICATION COMPLETE | Dokumen spesifikasi ada dan ditinjau |
| IMPLEMENTATION COMPLETE | Kode ada, dijalankan tanpa error |
| TEST EXECUTED | Tes dijalankan, ada log |
| TEST PASSED | Log tes lulus |
| VISUAL VERIFIED | Tangkapan layar atau pengamatan langsung |
| INTEGRATION VERIFIED | Berjalan bersama modul lain |
| MOBILE VERIFIED | Dicoba di iPhone Safari dan Android Chrome |
| OFFLINE VERIFIED | Dicoba dengan jaringan mati setelah muat pertama |
| DEPLOYMENT VERIFIED | Berjalan di GitHub Pages (subpath) |
| NOT VERIFIED | Default untuk segala hal tanpa bukti |

Dilarang mengklaim selesai hanya karena folder/file kosong ada, UI terlihat, fungsi belum dijalankan, tes hanya direncanakan, kode berupa pseudocode, atau aset hanya spesifikasi.
Gate per batch: batch lulus bila acceptance criteria-nya mencapai status yang ditetapkan di roadmap dengan bukti tercatat di BATCH_STATUS.
