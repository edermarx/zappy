const gel = element => document.querySelector(element);

gel('#add-contact-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const response = await axios.post(`/api/user/contact/${gel('input[name=contact]').value}`);
    console.log(response);
  } catch (err) {
    console.log(err.response.data);
  }
});

(async () => {
  const response = await axios.get('/api/user/contact');
  response.data.forEach((contact) => {
    gel('#contacts').innerHTML += `
      <p>${contact.alias}</p>
    `;
  });
})();