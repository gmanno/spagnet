import React from "react";
import { AppContainer } from "react-hot-loader";
import Consulta from "./componentes/Consulta";
import Carnets from "./componentes/Carnets";
import { Layout } from "antd";
import "antd/dist/antd.css";
import "./App.css";
import { Route, BrowserRouter } from "react-router-dom";

const App = () => {
  return (
    <AppContainer>
      <Layout className="principal">
        <BrowserRouter>
          <Route exact path="/teleconsulta/:jwt" component={Consulta} />
          <Route exact path="/carnets/:jwt" component={Carnets} />
        </BrowserRouter>
      </Layout>
    </AppContainer>
  );
};

export default App;
