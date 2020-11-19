import React from "react";

function Stores() {
  return (
      <div>
        <a
          href="https://play.google.com/store/apps/details?id=br.com.unimednatal.app"
					target="_blank"
					rel="noopener noreferrer"
          title="Google Play"
        >
          <img
            src="https://www.unimednatal.com.br/images/min/google-play@2x.png"
            alt="Google Play"
          />
        </a>
        <a
          href="https://itunes.apple.com/br/app/unimed-natal-benefici%C3%A1rio/id1446281845?mt=8"
					target="_blank"
					rel="noopener noreferrer"
          title="AppStore"
        >
          <img
            src="https://www.unimednatal.com.br/images/min/appstore@2x.png"
            alt="AppStore"
          />
        </a>
      </div>
  );
}

export default Stores;
