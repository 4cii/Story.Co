const sekarang = new Date();
// variabel besar
const struk = {
    story: "Aku hari ini senang sekali",
    date: sekarang.toLocaleDateString('en-CA'),
    day: sekarang.toLocaleDateString('en-US', {weekday: 'long'}),
    time: sekarang.toLocaleTimeString('en-US',{
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }),
    mood: "Happy",
    code: "Latte",
    status: "pending"
}
console.log(struk)