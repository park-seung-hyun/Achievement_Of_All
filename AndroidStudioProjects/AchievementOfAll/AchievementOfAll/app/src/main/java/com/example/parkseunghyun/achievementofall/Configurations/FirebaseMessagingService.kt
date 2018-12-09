package com.example.parkseunghyun.achievementofall.Configurations

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.RingtoneManager
import android.support.v4.app.NotificationCompat
import com.example.parkseunghyun.achievementofall.Activities.HomeActivity
import com.example.parkseunghyun.achievementofall.R
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

/**
    REFACTORED
 */

class FirebaseMessagingService : FirebaseMessagingService() {

    var fcmTitle: String? = null
    var fcmBody: String? = null


    override fun onMessageReceived(remoteMessage: RemoteMessage?) {

        sendNotification(

                remoteMessage?.data?.get("title"),
                remoteMessage?.data?.get("body"),
                remoteMessage?.data?.get("user"),
                remoteMessage?.data?.get("checkReason")

        )

    }

    private fun sendNotification(messageTitle: String?, messageBody: String?, rejectUserArray: String?, rejectReasonArray: String?) {

/**
         컨텐츠 실패 : Title - 실패, Body - 컨텐츠명
         인증시간 임박 : Title - 인증, Body - 컨텐츠명
         컨텐츠 성공 : Title - 성공, Body - 컨텐츠명
         인증 비디오 과반수 실패 : Title - 비디오실패, Body - 컨텐츠명
         성공 예정 : Title - 성공예정, Body - 컨텐츠명
*/

        fcmTitle = messageBody

        when( messageTitle ) {

            "실패" -> { fcmBody = "목표 달성 실패 알림" }

            "인증" -> { fcmBody = "인증 시간이 얼마 남지 않았어요!" }

            "성공" -> { fcmBody = "목표 달성 성공 알림" }

            "비디오실패" -> { fcmBody = "과반수의 반대로 인증에 실패하셨습니다" }

            "성공예정" -> { fcmBody = "마지막 인증까지 성공하셨습니다! 컨텐츠 종료일에 보상을 받으실 수 있습니다." }

        }

        val intentToHome = Intent(this, HomeActivity::class.java)
        intentToHome.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
        intentToHome.putExtra("fcm_category", fcmBody)
        intentToHome.putExtra("contentName", fcmTitle)
        intentToHome.putExtra("rejectUserArray", rejectUserArray)
        intentToHome.putExtra("rejectReasonArray", rejectReasonArray)

        val pendingIntent = PendingIntent.getActivity(this, 0 /* request code */, intentToHome, PendingIntent.FLAG_UPDATE_CURRENT)

        val alarmVibePattern = longArrayOf(500, 500, 500, 500, 500)
        val defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)

        val notificationBuilder = NotificationCompat.Builder(this, "notify_001")

                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentTitle(fcmTitle)
                .setContentText(fcmBody)
                .setAutoCancel(true)
                .setVibrate(alarmVibePattern)
                .setPriority(NotificationCompat.PRIORITY_DEFAULT)
                .setSound(defaultSoundUri)
                .setContentIntent(pendingIntent) as NotificationCompat.Builder

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        val channel = NotificationChannel("notify_001", "FCM_CHANNEL", NotificationManager.IMPORTANCE_DEFAULT)
        notificationManager.createNotificationChannel(channel)
        notificationBuilder.setChannelId("notify_001")
        notificationManager.notify(0 /* ID of notification */, notificationBuilder.build())

    }

}
