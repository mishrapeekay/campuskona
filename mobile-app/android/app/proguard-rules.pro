
# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.flipper.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.soloader.** { *; }

# React Native Reanimated
-keep class com.swmansion.reanimated.** { *; }
-keep class com.facebook.react.turbo.** { *; }

# React Native Screens
-keep class com.swmansion.rnscreens.** { *; }

# React Native Gesture Handler
-keep class com.swmansion.gesturehandler.** { *; }

# React Native Safe Area Context
-keep class com.th3rdwave.safeareacontext.** { *; }

# React Native SVG
-keep class com.horcrux.svg.** { *; }

# React Native Vector Icons
-keep class com.oblador.vectoricons.** { *; }

# React Native Fast Image
-keep class com.dylanvann.fastimage.** { *; }

# React Native Device Info
-keep class com.learnium.RNDeviceInfo.** { *; }

# React Native KeyChain
-keep class com.oblador.keychain.** { *; }

# React Native Biometrics
-keep class com.rnbiometrics.** { *; }

# React Native Razorpay
-keep class com.razorpay.** { *; }
-dontwarn com.razorpay.**

# React Native Firebase
-keep class io.invertase.firebase.** { *; }

# React Native Maps
-keep class com.airbnb.android.react.maps.** { *; }

# React Native PDF
-keep class com.christopherdro.htmltopdf.** { *; }
-keep class com.cnj.rn.pdf.** { *; }

# OkHttp
-keepattributes Signature
-keepattributes *Annotation*
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }
-dontwarn okhttp3.**

# Gson
-keep class com.google.gson.** { *; }

# Redux Persist & Async Storage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# General
-dontwarn com.facebook.react.**
-keepattributes InnerClasses,EnclosingMethod,Signature,SourceFile,LineNumberTable
