import React, { useState } from "react";

import routes from "routes/routes";

import { enroll } from "services/professor.service";

import { phoneMask, formatPhone, dateMask, formatDateToSend } from "helpers/masks";

import Page from "components/Page/Page";
import PageTitle from "components/PageTitle/PageTitle";
import Container from "components/Container/Container";
import Input from "components/Input/Input";
import PhoneInput from "components/PhoneInput/PhoneInput";
import DateInput from "components/DateInput/DateInput";
import Button from "components/Button/Button";
import Dropdown from "components/Dropdown/Dropdown";
import { toast } from "react-toastify";

import styles from "./ProfessorEnroll.module.scss";

const ProfessorEnroll = ({ history, match }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConf, setPasswordConf] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState("");
  const [area, setArea] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const options = [
    { id: 1, value: "Gender", text: "Gênero", selected: true, disabled: true },
    { id: 2, value: "M", text: "M", selected: false, disabled: false },
    { id: 3, value: "F", text: "F", selected: false, disabled: false },
    { id: 4, value: "N", text: "Não me identifico", selected: false, disabled: false },
  ];

  const submitEnroll = (e, data) => {
    e.preventDefault();

    const { password, password_conf } = data;
    if (password !== password_conf) {
      toast.error("A senha e sua confirmação estão diferentes");
      return;
    }
    setIsLoading(true);

    const { phone, birthday } = data;
    data.phone = formatPhone(phone);
    data.birthday = formatDateToSend(birthday);

    enroll(data)
      .then(() => {
        history.push(routes.LOGIN);
        toast.success("Cadastro feito! Agora é só fazer o login");
      })
      .catch((err) => {
        err.response && err.response.status === 400
          ? toast.error("Ops! Parece que esse token foi expirado")
          : toast.error("Ops! Aconteceu algum erro");
        setIsLoading(false);
      });
  };

  return (
    <Page>
      <PageTitle title="Cadastro de Novx Professorx" icon="fas fa-chalkboard-teacher" />
      <Container>
        <div className={styles.container}>
          <form
            className={styles.form}
            onSubmit={(e) =>
              submitEnroll(e, {
                name,
                email,
                phone,
                password,
                password_conf: passwordConf,
                birthday,
                gender,
                area,
                inviteToken: match.params.token,
              })
            }
          >
            <div className={styles.section}>
              <span className={styles.section__label}>Dados Principais</span>
              <Input
                placeholder="Nome"
                type="text"
                onChange={(e) => setName(e.target.value)}
                value={name}
                required
              />
              <Input
                placeholder="Email"
                type="email"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                required
              />
              <PhoneInput
                placeholder="Telefone (99) 9XXXX-XXXX"
                onChange={(e) => setPhone(phoneMask(e.target.value))}
                value={phone}
                required
                min={11}
              />
            </div>
            <div className={styles.section}>
              <span className={styles.section__label}>Dados Opcionais</span>
              <DateInput
                placeholder="Data de Nascimento dd/mm/aaaa"
                onChange={(e) => setBirthday(dateMask(e.target.value))}
                value={birthday}
                required
                min={8}
              />
              <div className={styles.section__dropdown}>
                <Dropdown name="gender" options={options} onSelect={setGender} />
              </div>
              <Input
                placeholder="Curso/Área de Trabalho"
                type="text"
                onChange={(e) => setArea(e.target.value)}
                value={area}
              />
            </div>
            <div className={styles.section}>
              <span className={styles.section__label}>Autenticação</span>
              <Input
                placeholder="Senha"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                required
              />
              <Input
                placeholder="Confirmação da Senha"
                type="password"
                onChange={(e) => setPasswordConf(e.target.value)}
                value={passwordConf}
                required
              />
              <div className={styles.section__button}>
                <Button
                  text="Enviar"
                  kind="success"
                  type="submit"
                  isLoading={isLoading}
                  disabled={isLoading}
                />
              </div>
            </div>
          </form>
        </div>
      </Container>
    </Page>
  );
};

export default ProfessorEnroll;
