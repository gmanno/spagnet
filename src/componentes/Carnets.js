import React, { useState, useEffect, useCallback } from "react";
import {
  Row,
  Col,
  Form,
  Input,
  Button,
  Spin,
  Select,
  notification,
} from "antd";
import { cartaoMask } from "../util/cartao";
import axios from "../util/Api";
import { recaptchaToken, appName } from "../util/config";
import { loadReCaptcha, ReCaptcha } from "react-recaptcha-v3";
import Cards from "react-credit-cards";
import moment from "moment";
import "react-credit-cards/es/styles-compiled.css";
const Option = Select.Option;

const FormItem = Form.Item;
const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function Consulta(props) {
  const [loader, setLoader] = useState(false);
  const [optsParcelas, setOptsParcelas] = useState(null);
  const [dados, setDados] = useState(null);
  const [msgContent, setMsgContent] = useState(null);
  const [captchaValidado, setCaptchaValidado] = useState(false);
  const type = "credit";
  const [card, setCard] = useState({
    expiry: "",
    focus: "",
    name: "",
    issuer: "",
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
    let jwt = props.match.params.jwt;
    form.validateFields().then((values) => {
      axios
        .post("/beneficiarios/pagar_carnets", {
          ...values,
          issuer: card.issuer,
          type: type,
          jwt: jwt,
        })
        .then(({ data }) => {
          if (data.pagamento_aprovado === true) {
            setDados(null);
            if (type === "credit") {
              setMsgContent(<h3>{data.mensagem}</h3>);
            } else {
              window.location = data.auth_url;
            }
          } else {
            form.setFieldsValue({
              number: null,
              name: null,
              expiry: null,
              cvc: null,
            });
            setCard({
              expiry: "",
              focus: "",
              name: "",
              issuer: "",
              number: "",
              cvc: "",
              valid: false,
            });
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
    setCard({ ...card, valid: valid, issuer: dados.issuer });
  };
  const handleBlur = () => {
    setCard({ ...card, focus: "" });
  };
  const handleFocus = () => {
    setCard({ ...card, focus: "cvc" });
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
    if (valor.length === 7) {
      let hoje = moment();
      let data = moment(valor, "MM/YYYY");

      return data.isValid() && data > hoje;
    }
    return false;
  };
  const getConsultaData = useCallback(() => {
    axios
      .post("/beneficiarios/carnets_atrasados", {
        token: props.match.params.jwt,
      })
      .then(({ data }) => {
        if (data.ok === true) {
          if (data.carnets.length === 0) {
            setMsgContent(<h3>Nenhum carnet em atraso encontrado.</h3>);
          } else {
            let opts = [];
            for (let p = 1; p <= data.max_parcelas; p++) {
              opts.push(<Option value={p}>{p}</Option>);
            }

            setOptsParcelas(opts);
            setDados(data);
          }
        } else {
          setDados(null);
          setMsgContent(<h3>{data.mensagem}</h3>);

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

  const carregaMensagem = () => {
    return <div className="dadosBenef">{msgContent}</div>;
  };

  const carregaBenef = () => {
    return (
      <div className="dadosBenef">
        <Row>
          <Col span={24}>
            Digite os dados do cartão de crédito para fazer<br></br>o pagamento
            dos carnets.
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <b>Nome:</b>
          </Col>
          <Col span={24}>{dados.beneficiario.nome_beneficiario}</Col>
        </Row>
        <Row>
          <Col span={6}>
            <b>CPF:</b>
          </Col>
          <Col span={20}>
            {(dados.beneficiario.cpf + "")
              .padStart(11, "0")
              .replace(/(\d{3})(\d{3})(\d{3})(\d{1})/, "$1.$2.$3-$4")}
          </Col>
        </Row>

        <Row>
          <Col span={24}>
            Carnets:
            <ul>
              {dados.carnets.map((carnet) => (
                <li>
                  {money.format(carnet.valor_total)} -{" "}
                  {moment(carnet.data_vencimento, "YYYY-MM-DD").format(
                    "DD/MM/YYYY"
                  )}
                </li>
              ))}{" "}
            </ul>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <b>Valor Total:</b>
          </Col>
          <Col span={20}>{money.format(dados.valor_total)}</Col>
        </Row>
        <Row>
          <Cards
            cvc={card.cvc}
            expiry={card.expiry}
            focused={card.focus}
            name={card.name}
            number={card.number}
            acceptedCards={[
              "visa",
              "mastercard",
              "hipercard",
              "discover",
              "elo",
            ]}
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
              name="parcelas"
              rules={[
                {
                  required: true,
                  message: "Número de parcelas",
                },
              ]}
            >
              <Select placeholder="Número de parcelas">{optsParcelas}</Select>
            </FormItem>
          </Row>
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
                autoComplete="cc-number"
                style={{ width: "210px" }}
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
                style={{ width: "210px" }}
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
                  placeholder="MM/AAAA"
                  onChange={changeInput}
                  style={{ width: "120px" }}
                  maxLength="7"
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
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  autoComplete="cc-csc"
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
              {dados === null ? carregaMensagem() : carregaBenef()}
            </Spin>
          </Row>
        </div>
      </Row>
    </Col>
  );
}

export default Consulta;
