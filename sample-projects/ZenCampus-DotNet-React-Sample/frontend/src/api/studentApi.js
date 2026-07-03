// Every function here does exactly one thing: talk to one .NET endpoint and
// return plain JS data. Components never call fetch() directly — they call
// these functions, so the API's actual URL/shape only needs to change in
// one place if the backend ever moves or changes.

const API_BASE = 'http://localhost:5041/api/students';

async function handleResponse(res) {
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }
  // 204 No Content (PUT/DELETE) has no body to parse.
  if (res.status === 204) return null;
  return res.json();
}

export function getStudents() {
  return fetch(API_BASE).then(handleResponse);
}

export function getStudent(id) {
  return fetch(`${API_BASE}/${id}`).then(handleResponse);
}

export function createStudent(student) {
  return fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student),
  }).then(handleResponse);
}

export function updateStudent(id, student) {
  return fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(student),
  }).then(handleResponse);
}

export function deleteStudent(id) {
  return fetch(`${API_BASE}/${id}`, { method: 'DELETE' }).then(handleResponse);
}
