const inquirer = require("inquirer");
const chalk = require("chalk");
const fs = require("fs");

operation();

function operation() {
  inquirer
    .prompt([
      {
        type: "list",
        name: "action",
        message: "O que você deseja fazer?",
        choices: [
          "Criar Conta",
          "Consultar Saldo",
          "Depositar",
          "Sacar",
          "Transferir",
          "Simular Emprestimo",
          "Sair",
        ],
      },
    ])
    .then((answer) => {
      const action = answer["action"];

      if (action === "Criar Conta") {
        createAccount();
      } else if (action === "Consultar Saldo") {
        getAccountBalance();
      } else if (action === "Depositar") {
        deposit();
      } else if (action === "Sacar") {
        withdraw();
      } else if (action === "Transferir") {
        transfer();
      } else if (action === "Simular Emprestimo") {
        loanCalculator();
      } else if (action === "Sair") {
        console.log(chalk.bgBlue.black("Obrigado por usar o Accounts !"));
        process.exit();
      }
    })
    .catch((err) => console.log(err));
}

function createAccount() {
  console.log(chalk.bgGreen.black("Parabéns por escolher o nosso banco!"));
  console.log(chalk.green("Defina as opções da sua conta a seguir"));

  buildAccount();
}

function buildAccount() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Digite um nome para sua conta:",
      },
    ])
    .then((answer) => {
      accountName = answer["accountName"];

      console.info(accountName);

      if (!fs.existsSync("accounts")) {
        fs.mkdirSync("accounts");
      }

      if (checkAccounts(accountName)) {
        console.log(
          chalk.bgRed.black("Essa conta já existe, escolha outro nome !")
        );

        buildAccount();
        return;
      }

      fs.writeFileSync(
        `accounts/${accountName}.json`,
        '{"balance": 0}',
        function (err) {
          console.log(err);
        }
      );

      console.log(chalk.green("Parabéns, a sua conta foi criada !"));
      operation();
    })
    .catch((err) => console.log(err));
}

function deposit() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: " Qual o nome da sua conta ?",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];

      if (!checkAccounts(accountName)) {
        return deposit();
      }

      inquirer
        .prompt([
          {
            name: "amount",
            message: "Quanto você deseja depositar ?",
          },
        ])
        .then((answer) => {
          const amount = answer["amount"];

          addAmount(accountName, amount);

          operation();
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
}

function checkAccounts(accountName) {
  if (!fs.existsSync(`accounts/${accountName}.json`)) {
    console.log(
      chalk.bgRed.black("Essa conta nāo existe, escolha outro nome !")
    );
    return false;
  }
  return true;
}

function addAmount(accountName, amount) {
  const accountData = getAccount(accountName);

  if (!amount) {
    console.log(
      chalk.bgRed.black("Ocorreu um erro, tente novamente mais tarde !")
    );

    return;
  }

  accountData.balance = parseFloat(amount) + parseFloat(accountData.balance);

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    function (err) {
      console.log(err);
    }
  );

  console.log(
    chalk.green(`Foi depositado o valor de $ ${amount} na sua conta !`)
  );
}

function getAccount(accountName) {
  const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
    encoding: "utf8",
    flag: "r",
  });

  return JSON.parse(accountJSON);
}

function getAccountBalance() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta ?",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];

      if (!checkAccounts(accountName)) {
        return getAccountBalance();
      }

      const accountData = getAccount(accountName);

      console.log(
        chalk.bgBlue.black(
          `Olá, o saldo da sua conta é de R$ ${accountData.balance}`
        )
      );
      operation();
    })
    .catch((err) => console.log(err));
}

function withdraw() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta ?",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];

      if (!checkAccounts(accountName)) {
        return withdraw();
      }

      inquirer
        .prompt([
          {
            name: "amount",
            message: "Quanto você deseja sacar ?",
          },
        ])
        .then((answer) => {
          const amount = answer["amount"];

          removeAmount(accountName, amount);
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
}

function removeAmount(accountName, amount) {
  const accountData = getAccount(accountName);

  if (!amount) {
    console.log(
      chalk.bgRed.black("Ocorreu um erro, tente novamente mais tarde !")
    );
    return;
  }
  if (accountData.balance < amount) {
    console.log(chalk.bgRed.black("Valor indisponivel !!"));
    return;
  }

  accountData.balance = parseFloat(accountData.balance) - parseFloat(amount);

  fs.writeFileSync(
    `accounts/${accountName}.json`,
    JSON.stringify(accountData),
    function (err) {
      console.log(err);
    }
  );

  console.log(
    chalk.green(`Foi realizado um saque de R$ ${amount} da sua conta !`)
  );
  operation();
}

async function transfer() {
  try {
      const answer = await inquirer.prompt([
          {
              name: "accountName",
              message: "Qual o nome da sua conta?",
          },
      ]);
      const accountName = answer['accountName'];

      if (!checkAccounts(accountName)) {
          return transfer();
      }

      const answerTransfer = await inquirer.prompt([
          {
              name: "accountTransferName",
              message: "Qual o nome da conta na qual deseja realizar a transferencia?",
          },
      ]);
      const accountTransferName = answerTransfer['accountTransferName'];

      if (!checkAccounts(accountTransferName)) {
          return transfer();
      }

      const answerAmount = await inquirer.prompt([
          {
              name: "amount",
              message: "Qual o valor da transferencia?",
              validate: function (input) {
                  const isValid = parseFloat(input);
                  return isValid > 0 || "Por favor, insira um valor válido maior que 0.";
              },
          },
      ]);
      const amount = answerAmount['amount'];

      const sourceAccountData = getAccount(accountName);

      if (parseFloat(sourceAccountData.balance) < parseFloat(amount)) {
          console.log(chalk.bgRed.black("Saldo insuficiente para a transferência!"));
          return transfer();
      }

      removeAmount(accountName, amount);
      addAmount(accountTransferName, amount);

      console.log(chalk.bgGreen.black(`Transferência realizada com sucesso. Você transferiu R$ ${amount} de sua conta para a conta ${accountTransferName}`));
  } catch (err) {
      console.log(err);
  }
}


function loanCalculator() {
  inquirer
    .prompt([
      {
        name: "accountName",
        message: "Qual o nome da sua conta ?",
      },
    ])
    .then((answer) => {
      const accountName = answer["accountName"];

      if (!checkAccounts(accountName)) {
        return loanCalculator();
      }
      inquirer
        .prompt([
          {
            name: "amount",
            message: "Qual o valor do emprestimo para sua conta ?",
          },
        ])
        .then((answer) => {
          const amount = answer["amount"];
          const accountData = getAccount(accountName);
          var loan = 0;

          if (accountData.balance >= 3000) {
            loan = parseFloat(amount) * 1.05;
          } else {
            loan = parseFloat(amount) * 1.1;
          }

          console.log(
            chalk.green(`O emprestimo de R$ ${amount} saira por R$ ${loan}`)
          );
          operation();
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
}
