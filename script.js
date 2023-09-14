// k6 run script.js

import http from 'k6/http';
import { check, sleep } from 'k6';
export const options = {
  discardResponseBodies: true,
  scenarios: {
    contacts: {
      executor: 'constant-arrival-rate',
      rate: 20,
      timeUnit: '1s',
      duration: '40s',
      preAllocatedVUs: 50,
      maxVUs:100,
    },
  },
};
// test HTTP
export default function () {
    const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTM0LCJpYXQiOjE2OTE2NDc4MjIsImV4cCI6MTY5MTczNDIyMn0.-Hs6ax4KcJpxZAqn1NwyAzPdRWaY7AYM8eWUZZs6JrA';
    const headers = {
        'Authorization': `Bearer ${accessToken}`,
    };
    const res = http.get(`http://18.180.135.37/api/1.0/posts/search`,{headers:headers});
    check(res, { 'status was 200': (r) => r.status == 200 });
    sleep(1);
}
