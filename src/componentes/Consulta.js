import React, { useState, useEffect, useCallback } from "react";
import { Row, Col, Form, Input, Button, Spin, notification } from "antd";
import { cartaoMask } from "../util/cartao";
import axios from "../util/Api";
import { recaptchaToken, appName } from "../util/config";
import { loadReCaptcha, ReCaptcha } from "react-recaptcha-v3";
import moment from 'moment';

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

  const changeCartao = (e) => {
    let valor = cartaoMask(e.target.value);
    form.setFieldsValue({ cartao: cartaoMask(valor) });
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
          <Col span={20}>{moment(dados.agm_hini, "YYYY-MM-DD H:mm:ss").format("DD/MM/YYYY H:mm")}</Col>
        </Row>

        <Form form={form} onFinish={onFinish}>
          <Row>
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
          </Row>
          <Row>
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
          </Row>
          <Row>
            <FormItem
              name="mes"
              rules={[
                {
                  required: true,
                  message: "Mês",
                },
              ]}
            >
              <Input
                placeholder="Mês"
                style={{ width: "50px" }}
                maxLength="2"
              />
              /
            </FormItem>
            <FormItem
              name="ano"
              rules={[
                {
                  required: true,
                  message: "Ano",
                },
              ]}
            >
              <Input
                placeholder="Ano"
                style={{ width: "50px" }}
                maxLength="2"
              />
            </FormItem>
          </Row>
          <Row>
            <FormItem
              name="cvv"
              rules={[
                {
                  required: true,
                  message: "Código de segurança",
                },
              ]}
            >
              <Input
                placeholder="cvv"
                style={{ width: "60px" }}
                maxLength="3"
              />
            </FormItem>
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
