import React, { useState, useEffect } from "react";
import { Row, Col, Form, Input, Button, Spin, notification } from "antd";
import { cartaoMask } from "../util/cartao";
import axios from "../util/Api";
import { recaptchaToken, appName } from "../util/config";
import { loadReCaptcha, ReCaptcha } from "react-recaptcha-v3";

const FormItem = Form.Item;

function Consulta(props) {
  const [loader, setLoader] = useState(false);
  const [dados, setDados] = useState(null);
  const [captchaValidado, setCaptchaValidado] = useState(false);
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
      axios
        .post("/beneficiarios/carteira_federacao", values)
        .then(({ data }) => {
          if (data.ok === true) {
            setDados(data);
            setTimeout(() => {
              clean();
            }, data.segundos * 1000);
          } else {
            setDados(null);
            form.setFieldsValue({ carteira: null, data_nascimento: null });
            notification.error({
              message: "Alerta",
              description: "Carteira ou data de nascimento incorretos",
            });
          }
          setLoader(false);
        });
    });
  };

  const changeCartao = (e) => {
    let valor = cartaoMask(e.target.value);
    
    form.setFieldsValue({ cartao: cartaoMask(valor) });
  };
  

  useEffect(() => {
    loadReCaptcha(recaptchaToken);
  }, [form]);

  const zeroPad = (num, places) => String(num).padStart(places, "0");
  const carregaBenef = () => {
    return (
      <div className="dadosBenef">
        <Row>
          <Col span={6}>
            <b>Nome:</b>
          </Col>
          <Col span={20}>{dados.beneficiario.nome_beneficiario}</Col>
        </Row>
        <Row>
          <Col span={6}>
            <b>Carteira:</b>
          </Col>
          <Col span={20}>
            {`${zeroPad(dados.beneficiario.unimed_carteira, 3)} ${zeroPad(
              dados.beneficiario.cod_carteira,
              12
            )} ${dados.beneficiario.dv_carteira}`}
          </Col>
        </Row>
        <Row>
          <Col span={6}>
            <b>Token:</b>
          </Col>
          <Col span={20}>{dados.token}</Col>
        </Row>
        <Row>
          <Button onClick={clean}>Voltar</Button>
        </Row>
      </div>
    );
  };
  const clean = () => {
    form.setFieldsValue({ carteira: null, data_nascimento: null });
    setDados(null);
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
            {dados === null ? (
              <p style={{ padding: "0 25px 10px 25px" }}>
                Digite os dados do cartão para fazer o pagamento da franquia da tele-consulta.
              </p>
            ) : (
              <Row style={{ padding: "0 20px 10px 20px" }}>
                <h3>Beneficiário encontrado</h3>
              </Row>
            )}
            <Spin spinning={loader} tip="carregando...">
              {dados === null ? (
                <Form form={form} onFinish={onFinish}>
                  <FormItem
                    name="cartao"
                    rules={[
                      {
                        required: true,
                        min: 19,
                        message: "Cartão inválido",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Cartão"
                      style={{ width: "200px" }}
                      maxLength="19"
                      onChange={changeCartao}
                    />
                  </FormItem>

                  <FormItem
                    name="nome"
                    rules={[
                      {
                        required: true,
                        message: "Nome no cartão",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Nome no cartão"
                      style={{ width: "200px" }}
                      maxLength="100"
                    />
                  </FormItem>
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
                      Buscar
                    </Button>
                  </FormItem>
                </Form>
              ) : (
                carregaBenef()
              )}
            </Spin>
          </Row>
          
        </div>
      </Row>
    </Col>
  );
}

export default Consulta;
