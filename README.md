# Dokunmatik ekran çizim tahmin uygulaması

## Proje yapısı

* Kullanıcı arayüzü: nwjs. Tarayıcı gerektirmeden web teknolojilerini kullanma imkanı sunan bir yapı. Eski adı node-webkit. Aynı zamanda platform-bağımsız. Windows ortamında masaüstü uygulaması için kullanıcı arayüzü geliştirmeye müsait. 
https://nwjs.io/

* Veri seti: Google quickdraw dataset.Toplam 365 kategoride 50 milyon çizim verisinden oluşuyor. Herkesin kullanımına açık ve ücretsiz bir kaynak. Tahmin motorunun geliştirilmesinde tahmin kabiliyeti test edilerek bu verilerin bir kısmı veya tamamı kullanılabilir.
https://github.com/googlecreativelab/quickdraw-dataset

* Tahmin motoru ve derin öğrenme modeli: CNN(Convolutional Neural Network) deirn öğrenme mimarisi kullanan Tensorflow Keras modeli. Tensorflow ve Keras derin öğrenme kütüphaneleri kullanılarak veri seti modellenebilir ve derin öğrenme gerçekleştirilebilir. Bu kütüphaneler ve gerekli olabilecek diğer veri işleme kütüphaneleri python programlara dilini sağlam bir şekilde destekliyor.

## React uygulamasi kurulum
```
npm install
npm run build
npm run build-electron
npm run package
npm run package-mac
npm run package-win
```
