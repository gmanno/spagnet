import React from "react";
import { AppContainer } from "react-hot-loader";
import Consulta from "./componentes/Consulta";
import { Layout } from "antd";
import "antd/dist/antd.css";
import "./App.css";

function App() {
  return (
    <AppContainer>
      <Layout className="principal">
        <Consulta />
      </Layout>
    </AppContainer>
  );
}

export default App;
