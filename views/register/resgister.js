const gel = element => document.querySelector(element);

gel('#register-form').addEventListener('submit', (e) => {
  e.preventDefault();
  try {
    axios.post('/api/user/register', {
      username: gel('input[name=username]').value,
      alias: gel('input[name=alias]').value,
      password: gel('input[name=password]').value,
      password2: gel('input[name=password2]').value,
    });
  } catch (err) {
    console.log(err.response.data);
  }
});