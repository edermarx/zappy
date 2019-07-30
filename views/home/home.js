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

setInterval(async () => {
  const response = await axios.get('/api/user/contact?tamanho=1');
  if(+response.data !== gel('#contacts').children.length){
    console.log(+response.data, gel('#contacts').children.length);
    const response2 = await axios.get('/api/user/contact');
    gel('#contacts').innerHTML = '';
    response2.data.forEach((contact) => {
      gel('#contacts').innerHTML += `
        <p>${contact.alias}</p>
      `;
    });
  }
}, 1000);