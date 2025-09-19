const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

let users = {}; // В реале заменить на базу данных

const PAYMENT_PROVIDER_TOKEN = 'YOUR_PAYMENT_PROVIDER_TOKEN';

app.post('/create-payment', (req, res) => {
    const { userId, amount } = req.body;
    if(!userId || !amount) return res.status(400).send('Missing params');

    const payload = `pay_${userId}_${Date.now()}`;

    res.json({
        chat_id: userId,
        provider_token: PAYMENT_PROVIDER_TOKEN,
        title: 'Пополнение монет',
        description: `Пополнение на ${amount} монет`,
        payload: payload,
        currency: 'RUB',
        prices: [{ label: 'Монеты', amount: amount*100 }]
    });
});

app.post('/payment-success', (req, res) => {
    const { user_id, amount } = req.body;
    if(!users[user_id]) users[user_id] = { coins:0, vip:0, firstTopup:true, bonusLevel:1 };

    let user = users[user_id];
    user.coins += amount;
    user.vip += Math.floor(amount/100);

    if(user.firstTopup){
        user.firstTopup = false;
        user.bonusLevel = 1;
        console.log(`User ${user_id} получил первый бонус уровня 1`);
    } else {
        user.bonusLevel += 1;
        console.log(`User ${user_id} повысил бонус до уровня ${user.bonusLevel}`);
    }

    console.log(`User ${user_id} пополнил ${amount}. VIP=${user.vip}, бонусLevel=${user.bonusLevel}`);
    res.sendStatus(200);
});

app.listen(3000, () => console.log('Server running on port 3000'));
