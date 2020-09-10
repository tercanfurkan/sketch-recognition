# YapayZeka - Çizim Tanıma Dokunmatik Ekran Win10 Uygulaması

## Proje yapısı

### Masaüstü uygulaması 
Esas yapı olarak [electron.js](https://www.electronjs.org/) kullanılmıştır. electron.js, javascript, html ve css kullanarak platform bağımsız masaüstü uygulaması geliştirmeyi sağlamıştır.

### Yapay zeka veri seti
Google quickdraw veri seti kullanılmıştır. Bu veri seti toplam 365 kategoride 50 milyon çizim verisinden oluşuyor. Herkesin kullanımına açık ve ücretsiz bir kaynak. Tahmin motorunun geliştirilmesinde tahmin kabiliyeti test edilerek bu verilerin bir kısmı kullanıldı (67 adet kategori ve her kategoriden 10000 örnek çekilerek).
https://github.com/googlecreativelab/quickdraw-dataset

### Tahmin motoru ve derin öğrenme modeli
CNN(Convolutional Neural Network) derin öğrenme mimarisi ve Tensorflow API'si kullanılarak modellenmiştir. Tensorflow derin öğrenme kütüphaneleri kullanılarak veri seti modellendi ve derin öğrenme gerçekleştirilmiştir. Yapay zeka modeli python dili ve tensorflow API kullanılarak gerçekleştirilmiştir. Bu model [tensorflow.js](https://www.tensorflow.org/js) API'sini destekleyecek yapıya dönüştürülmüştir. Web uygulaması içerisinde bu modele tensorflow.js API'si kullanılarak ulaşılmıştur.

## Geliştirme yapmak için:
### 1. npm ve node yükle
Geliştirme MacOs Catalina işletim sisteminde node 12.16.1 ve npm 6.13.4 versiyonları kullanılarak gerçekleştirilmiştir.
 
### 2. Web uygulamasının modüllerini yükle ve çalıştır
```
npm install
npm start
```

### 3. http://localhost:3000 adresine girerek web uygulamasını aç

## Windows 10 Uygulaması olarak paketlemek için:
### 1. Electron uygulamasının modüllerini yükle ve windows uygulamasını paketle
```
npm install
npm run prepare-win
```

### 2. cizimtanima/dist/ dizininde YapayZeka <versiyon_numarasi>.exe çalıştırılabilir dosyası kullanıma hazır. (örn: YapayZeka 0.7.2.exe)

## Windows 10 Uygulamasını başlangıç uygulaması olarak çalıştırmak için:
1. Windows logo + R tuşuna bas, calistir ekranina shell:startup yaz, OK butonuna tıkla. Bu islem baslangic dosyasini acar. 
2. YapayZeka.exe çalıştırılabilir dosyasinı 1. adımda açılan başlangıç dosyasına kopyala.
3. Bilgisayari yeniden başlat ve YapayZeka uygulamasi otomatik açılacaktır.

## Dokunmatik ekranda başka pencerelerin açılmasını engellemek için:
Windows 10'daki TaskView özelliğini devre dışı bırakmak gerekiyor
https://appuals.com/how-to-disable-task-view-on-windows-10/
