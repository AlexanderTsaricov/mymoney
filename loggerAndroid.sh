#!/bin/bash
# Логирует только приложение и React Native

PID=$(adb shell pidof host.exp.exponent)

if [ -z "$PID" ]; then
    echo "App не запущен"
    exit 1
fi

echo "Логирование pid=$PID"
adb logcat -v time --pid=$PID 2>&1 | tee ./logcat_detailed.log