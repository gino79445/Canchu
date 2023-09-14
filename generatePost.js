import http from 'k6/http';
import { sleep } from 'k6';

export default function () {
  for (let i = 0; i < 5000; i++) {
    const context = {context:`This is post number ${i}`};
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTM0LCJpYXQiOjE2OTE1MTY3NzgsImV4cCI6MTY5MTYwMzE3OH0.LaaM_jZPfOWPwel4LBEsKIFXwD7lfQnszsbKWRONaBQ'; // 這裡應該是有效的 JWT token

    const payload = JSON.stringify(context);
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };

    const response = http.post('https://18.180.135.37/api/1.0/posts', payload,  {headers} );
    if (response.status === 200) {
      console.log(`Post ${i} created`);
    } else {
      console.error(`Error creating post ${i}`);
    }

	  sleep(0.1);
  }
}

