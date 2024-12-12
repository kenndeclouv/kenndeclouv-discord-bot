const { EmbedBuilder } = require("discord.js");

const embed1 = new EmbedBuilder().setColor(0xf7f7f7).setImage("https://i.ibb.co/x1zSYTM/Frame-3.png");
const embed2 = new EmbedBuilder()
  .setColor(0xf7f7f7)
  .setTitle("> HALOO GUYS!")
  .setDescription("selamat datang di server rpl guys! biar server ini nyaman, seru, dan tetep produktif, sebelum masuk ke channelnya baca duluu yakk rulesnya!")
  .addFields({ name: "1. hormat, bruh!", value: "semua di sini temen belajar, jadi saling respect. toxic? jangan berlebihan lah." }, { name: "2. bahasa santai, asal ngga nyakitin.", value: "mau bercanda? boleh banget! asal jangan baperin orang lain atau bikin suasana rusuh." }, { name: "3. no spam, please.", value: "jangan nge-bomb chat kayak bot rusak. spam auto MUTE!" }, { name: "4. tanya? gas, asal di channel yang pas.", value: "lagi bingung? tanya aja! tapi liat dulu channel-nya, bro. jangan ngacak, ntar malah bikin pusing semua." }, { name: "5. tugas? kumpulin tepat waktu.", value: 'telat? yah, siap-siap dapet julukan "THE REMED SQUAD".😭' }, { name: "6. meme? YES.  JOMOK NO! .", value: "kita cinta humor, terutama yang nyentuh dunia rpl. tapi jangan sampe server jadi galeri meme gejelas, apalagi meme jomok!" }, { name: "7. ngoding bareng = bonding bareng.", value: "tiap akhir materi pelajaran, ada sesi project bareng. jangan lupa join biar mudah kerjainnya!" }, { name: "> Additional", value: "kamu bisa berkunjung ke channel <#1314480699126054973> untuk menemukan role mu sendiri dan membuka hidden channel!" })
  .setFooter({
    text: "enjoyy server!",
    iconURL: "https://i.ibb.co/PZjfdS0/rame-2.png",
  })
  .setTimestamp()
  .setImage("https://glitchii.github.io/embedbuilder/assets/media/banner.png");

function sendRulesMessage(channel) {
  channel.send({ embeds: [embed1, embed2] });
}

module.exports = { embed1, embed2, sendRulesMessage };
