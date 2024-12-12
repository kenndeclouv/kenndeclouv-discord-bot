const { EmbedBuilder } = require("discord.js");

const roleInfoEmbed = new EmbedBuilder()
  .setColor(0xf7f7f7)
  .setTitle("> ROLES INFO!")
  .setDescription(
    "Setiap user pasti punya role permissionnya masing masing, semakin banyak kamu online, berkontribusi dalam banyak projek, dan buat achievement lainnya kamu bakalan dapat role spesial dan tentunya previllage nya sendiri.\n\nberikut ini adalah rincian semua role yang ada di server ini!"
  )
  .addFields(
    {
      name: "> DECLOUV FAM",
      value: "<@&1314579201759907865> role ini udah jelas lah yaa buat server owner!",
    },
    {
      name: "> SUPERADMIN",
      value: "<@&1314380343394041867> role admin tertinggi yang ada di server ini. gabisa didapetin kecuali dikasi sama onwernya <@1158654757183959091>.",
    },
    {
      name: "> MASTER DEV",
      value: '<@&1314241442524168324> udah sepuh di dunia per"coding"an, rajin rajin ajaa ikut project, kumpulin tugas tepat waktu, nanti juga bisa dapet!',
    },
    {
      name: "> BOTS",
      value: "<@&1314376223580881017> dari namanya udah jelas lah yak!",
    },
    {
      name: "> KENNDECLOUV & LARADECLOUV",
      value: "<@&1314760904667041815> dan <@&1314264842546315288> adalah dua private bot server ini! kamu bisa berinteraksi dengan <@1314261573036146720> kalo udah punya role tertentu!",
    },
    {
      name: "> LEVEL 20",
      value: "<@&1314375259218251856> Level tertinggi yang bisa didapetin dari fitur leveling di discord server ini!",
    },
    {
      name: "> LEVEL 15",
      value: "<@&1314387090301259798> level 15, hadiah dari kamu sering aktif di server inii!",
    },
    {
      name: "> LEVEL 10",
      value: "<@&1314375157652914177> intermediate LEVEL!",
    },
    {
      name: "> BACKEND BESTIE",
      value: "<@&1314242604212293683> ini role apaa? yupp pecandu back-end",
    },
    {
      name: "> SENIOR DEV",
      value: "<@&1314241437344206908> udah lumayan sepuh ini role!",
    },
    {
      name: "> LEVEL 5",
      value: "<@&1314375062765174814> btw kamu bisa pake command  ``/level`` buat liat level kamu sekarang dan xp!",
    },
    {
      name: "> JUNIOR DEV",
      value: "<@&1314240971973726259> welcome junior developer! tanya tanya sama yang lebih sepuh bolee bangett",
    },
    {
      name: "> FRONTEND MAGICIAN",
      value: "<@&1314241446349635695> bisa front-end doang?",
    },
    {
      name: "> LEVEL 1",
      value: "<@&1314374871324561599> role welcomer di server inii!",
    },
    {
      name: "> X & XI & XI SQUAD",
      value: "<@&1314969695496966245> & <@&1314370787624484954> & <@&1314370540160417925> KELAS! penting buat akses home work!",
    },
    {
      name: "> THE REMED SQUAD",
      value: "<@&1314370872076664862> BUAT KLEAN YANG TELAT KUMPULIN TUGAS!",
    },
    {
      name: "> FORUM ROLES",
      value: "beberapa roles tambahan buat join forum tersembunyi!",
    },
    {
      name: "> @everyone",
      value: "role umum",
    }
  );

function sendRoleInfoMessage(channel) {
  channel.send({ embeds: [roleInfoEmbed] });
}

module.exports = { sendRoleInfoMessage };
