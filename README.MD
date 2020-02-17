## Discord Users Activity Tracker [DUAT]
Bot extension.

Sample code in sample.ts

```js
const djs = require('discord.js');
const duat = require('@kamidere/duat');

const client = new djs.Client();
let subscription;

client.on('ready', () => {
  subscription = duat.default(client).subscribe((user) => {
    console.log(user) // {userID, timestamp, guildId}
  })
})

client.on('disconnect', () => {
  subscription.unsubscribe();
})

client.login(process.env.DSC_TOKEN);
```

# Features
Track creating/editing/deleting messeges  
Track voice joining/leaving  

# ToDo
Track reactions
Fix exporting

# Thanks to
@soanvig for CR and explaining in RxJS