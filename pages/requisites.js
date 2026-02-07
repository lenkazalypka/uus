import React from 'react'
import Head from 'next/head'
import styles from '../styles/RequisitesPage.module.css'

export default function Requisites() {
  return (
    <>
      <Head>
        <title>Реквизиты</title>
      </Head>

      <main style={{ maxWidth: 800, margin: "0 auto", padding: "40px 16px" }}>
        <h1>Реквизиты</h1>

        <p><strong>Индивидуальный предприниматель</strong></p>
        <p>Иннокентьева Парасковья Аркадьевна</p>

        <p><strong>ИНН:</strong> 141902060960</p>
        <p><strong>ОГРНИП:</strong> 318144700042011</p>

        <p><strong>Юридический адрес:</strong><br />
          678462, Россия, Республика Саха (Якутия), Нюрбинский улус,  
          с. Чукар, ул. 70 лет Октября, д. 10
        </p>

        <p><strong>Расчётный счёт:</strong> 40802810700001689354</p>
        <p><strong>Банк:</strong> АО «ТБанк»</p>
        <p><strong>БИК:</strong> 044525974</p>

        <p style={{ marginTop: 32, fontSize: 14, opacity: 0.7 }}>
          Настоящие реквизиты используются для заключения договоров и приёма оплаты
          за онлайн-курсы и цифровые услуги.
        </p>
      </main>
    </>
  );
}
