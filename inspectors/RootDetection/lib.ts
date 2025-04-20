function a(pEvent:any){
    if(pEvent.data==null) return;

    var tag=null;
    var pCtx = pEvent.getContext();
    var isKnownRootAppsPackagesFrag = /(noshufou|smedialink|oneclick|zhiqupk|alephzain|chainfire|supersu|superuser|koushikdutta|thirdparty|yellowes|topjohnwu|magisk|kingroot|kingo)/i;
    var confirmKnowRoot = /(\.root|\.su|superu|supersu)/i;

    if(pEvent.data.value!=null && pEvent.data.value.match(isKnownRootAppsPackagesFrag)!=null && pEvent.data.value.match(confirmKnowRoot)!=null){
        tag = pCtx.getTagManager().getTag('security.detection.root.admin-app');
        pEvent.data.addTag(tag);
    }

    var isKnownDangerousAppsPackages = /(koushikdutta|com\.zmapp|dv\.marketmod|baseappfull|creeplays|zmapp|repodroid|allinone|blackmart|appquarantine|InAppBillingService|ramdroid|rommanager|dimonvideo|luckypatcher|chelpus)/i;
    var confirmKnownDangerousAppsPackages = /(patch|hack|\.fwd|installer|free|manager|rom|alpha|org\.|ram|\.COIN|\.LUCK|com\.zmapp)/i;

    if(pEvent.data.value!=null && pEvent.data.value.match(isKnownDangerousAppsPackages)!=null && pEvent.data.value.match(confirmKnownDangerousAppsPackages)!=null){
        tag = pCtx.getTagManager().getTag('security.detection.root.danger-app');
        pEvent.data.addTag(tag);
    }

    /*
    var isKnownDangerousAppsPackages = [
        "org.mobilism.android",
        "com.android.wp.net.log",
        "com.android.camera.update",
        "cc.madkite.freedom",
        "com.solohsu.android.edxp.manager",
        "org.meowcat.edxposed.manager",
        "com.xmodgame",
        "com.cih.game_cih",
        "com.charles.lpoqasert",
        "catch_.me_.if_.you_.can_"
    ];


    var isKknownRootCloakingPackages = [
        "com.devadvance.rootcloak",
        "com.devadvance.rootcloakplus",
        "de.robv.android.xposed.installer",
        "com.saurik.substrate",
        "com.zachspong.temprootremovejb",
        "com.amphoras.hidemyroot",
        "com.amphoras.hidemyrootadfree",
        "com.formyhm.hiderootPremium",
        "com.formyhm.hideroot"
    ];*/

    var isSuPath = [
        "/data/local/",
        "/data/local/bin/",
        "/data/local/xbin/",
        "/sbin/",
        "/su/bin/",
        "/system/bin/",
        "/system/bin/.ext/",
        "/system/bin/failsafe/",
        "/system/sd/xbin/",
        "/system/usr/we-need-root/",
        "/system/xbin/",
        "/cache/",
        "/data/",
        "/dev/",
    ].indexOf(pEvent.data.value);

    if(pEvent.data.value!=null && (isSuPath>-1 || /(bin\/su)/.test(pEvent.data.value) || /\/su^/.test(pEvent.data.value) )){
        tag = pCtx.getTagManager().getTag('security.detection.root.admin-bin');
        pEvent.data.addTag(tag);
    }


    var isSuPath = [
        "/data/local/",
        "/data/local/bin/",
        "/data/local/xbin/",
        "/sbin/",
        "/su/bin/",
        "/system/bin/",
        "/system/bin/.ext/",
        "/system/bin/failsafe/",
        "/system/sd/xbin/",
        "/system/usr/we-need-root/",
        "/system/xbin/",
        "/cache/",
        "/data/",
        "/dev/",
    ].indexOf(pEvent.data.value);

    if(pEvent.data.value!=null && (isSuPath>-1 || /(bin\/su)/.test(pEvent.data.value) || /\/su^/.test(pEvent.data.value) )){
        tag = pCtx.getTagManager().getTag('security.detection.root.admin-bin');
        pEvent.data.addTag(tag);
    }

    var isAdminBin = [
        /^[sS][uU]$/
    ];

    for(let i=0; i<isAdminBin.length; i++){
        if(pEvent.data.value!=null && isAdminBin[i].test(pEvent.data.value)){
            tag = pCtx.getTagManager().getTag('security.detection.root.admin-bin');
            pEvent.data.addTag(tag);
            break;
        }
    }

}