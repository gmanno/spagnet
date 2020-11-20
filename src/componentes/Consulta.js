import React, { useState, useEffect, useCallback } from "react";
import { Row, Col, Form, Input, Button, Spin, notification } from "antd";
import { cartaoMask } from "../util/cartao";
import axios from "../util/Api";
import { recaptchaToken, appName } from "../util/config";
import { loadReCaptcha, ReCaptcha } from "react-recaptcha-v3";
import Cards from "react-credit-cards";
import moment from "moment";
import "react-credit-cards/es/styles-compiled.css";

const FormItem = Form.Item;

function Consulta(props) {
  const [loader, setLoader] = useState(false);
  const [dados, setDados] = useState(null);
  const [captchaValidado, setCaptchaValidado] = useState(false);
  const [card, setCard] = useState({
    expiry: "",
    focus: "",
    name: "",
    number: "",
    cvc: "",
    valid: false,
  });
  const [form] = Form.useForm();

  const verifyCallback = (recaptchaToken) => {
    axios
      .post("/recaptcha", { recaptchaToken: recaptchaToken })
      .then(({ data }) => {
        if (data.status === true) {
          setCaptchaValidado(true);
        } else {
          setCaptchaValidado(false);
        }
      });
  };

  const onFinish = (values) => {
    setLoader(true);
    form.validateFields().then((values) => {
      axios.post("/teleconsulta/pagamento", values).then(({ data }) => {
        if (data.ok === true) {
        } else {
          setDados(null);
          form.setFieldsValue({ cartao: null, nome: null });
          notification.error({
            message: "Alerta",
            description: data.mensagem,
          });
        }
        setLoader(false);
      });
    });
  };

  const handleCard = (dados, valid) => {
    console.log(dados);
    console.log(valid);
    setCard({ ...card, valid: valid });
  };
  const handleBlur = () => {
    setCard({ ...card, focus: "" });
  };
  const changeInput = (e) => {
    const { id, value } = e.target;
    setCard({ ...card, [id]: value, focus: id });
    switch (id) {
      case "number":
        form.setFieldsValue({ [id]: cartaoMask(value) });
        break;
      case "expiry":
        form.setFieldsValue({
          [id]: value.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "$1/$2"),
        });
        break;
      default:
        break;
    }
  };
  const checkValidade = (valor) => {
    if (valor.length === 5) {
      let hoje = moment();
      let data = moment(valor, "MM/YY");
      
      return data.isValid() && data > hoje;
    }
    return false;
  };
  const getConsultaData = useCallback(() => {
    axios
      .post("/teleconsulta/info", {
        token: props.match.params.jwt,
      })
      .then(({ data }) => {
        if (data.ok === true) {
          setDados(data.retorno);
        } else {
          setDados(null);

          notification.error({
            message: "Alerta",
            description: "Dados não encontrados.",
          });
        }
        setLoader(false);
      });
  }, [props]);

  useEffect(() => {
    getConsultaData();
    loadReCaptcha(recaptchaToken);
  }, [getConsultaData]);

  const carregaBenef = () => {
    return (
      <div className="dadosBenef">
        <Row>
          <Col span={24}>
            Digite os dados do cartão para fazer<br></br>o pagamento da franquia
            da tele-consulta.
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <b>Nome:</b>
          </Col>
          <Col span={20}>{dados.agm_pac_nome}</Col>
        </Row>
        <Row>
          <Col span={6}>
            <b>Carteira:</b>
          </Col>
          <Col span={20}>
            {dados.pac_mcnv.replace(/(\d{3})(\d{12})(\d{1})/, "$1 $2 $3")}
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <b>Horário da consulta:</b>
          </Col>
          <Col span={20}>
            {moment(dados.agm_hini, "YYYY-MM-DD H:mm:ss").format(
              "DD/MM/YYYY H:mm"
            )}
          </Col>
        </Row>
        <Row>
          <Cards
            cvc={card.cvc}
            expiry={card.expiry}
            focused={card.focus}
            name={card.name}
            number={card.number}
            callback={handleCard}
            locale={{
              valid: "válido até",
            }}
            placeholders={{
              name: "SEU NOME AQUI",
            }}
          />
        </Row>
        <Form form={form} onFinish={onFinish}>
          <Row>
            <FormItem
              name="number"
              rules={[
                {
                  validator: () =>
                    card.valid
                      ? Promise.resolve()
                      : Promise.reject("Cartão inválido"),
                },
                {
                  required: true,
                  message: "Número do cartão obrigatório",
                },
              ]}
            >
              <Input
                placeholder="Cartão"
                autocompletetype="cc-number"
                autocomplete="cc-number"
                style={{ width: "200px" }}
                maxLength="19"
                onChange={changeInput}
              />
            </FormItem>
          </Row>
          <Row>
            <FormItem
              name="name"
              rules={[
                {
                  required: true,
                  message: "Nome no cartão",
                },
              ]}
            >
              <Input
                placeholder="Nome no cartão"
                onChange={changeInput}
                style={{ width: "200px" }}
                maxLength="100"
              />
            </FormItem>
          </Row>
          <Row>
            <Col span={11}>
              <FormItem
                name="expiry"
                rules={[
                  {
                    required: true,
                    min: 5,
                    validator: (_, value) =>
                      checkValidade(value)
                        ? Promise.resolve()
                        : Promise.reject("Validade inválida"),
                  },
                ]}
              >
                <Input
                  placeholder="MM/AA"
                  onChange={changeInput}
                  style={{ width: "100px" }}
                  maxLength="5"
                />
              </FormItem>
            </Col>
            <Col span={6}>
              <FormItem
                name="cvc"
                rules={[
                  {
                    required: true,
                    message: "Código de segurança",
                  },
                ]}
              >
                <Input
                  onChange={changeInput}
                  onBlur={handleBlur}
                  autocomplete="cc-csc"
                  style={{ width: "60px" }}
                  maxLength="3"
                />
              </FormItem>
            </Col>
          </Row>
          <div>
            <ReCaptcha
              sitekey={recaptchaToken}
              action={appName + "_login"}
              verifyCallback={verifyCallback}
            />
          </div>

          <FormItem>
            <Button
              type="alert"
              key="buttonSubmit"
              htmlType="submit"
              disabled={loader || !captchaValidado}
            >
              Confirmar
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  };

  return (
    <Col span={24}>
      <Row justify="center" align="middle">
        <div className="mainContent">
          <Row justify="center" align="top">
            <img
              src="https://api.unimednatal.com.br/api/imgs/logos/logo2.png"
              style={{ width: "200px" }}
              alt="Unimed"
            />
          </Row>

          <Row
            justify="center"
            align="top"
            className="formBusca"
            style={{ width: "100%" }}
          >
            <Spin spinning={loader} tip="carregando...">
              {dados === null ? "" : carregaBenef()}
            </Spin>
          </Row>
        </div>
      </Row>
    </Col>
  );
}

export default Consulta;
