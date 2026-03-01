import 'react-native-gesture-handler';
import { registerRootComponent } from "expo";

import App from "./App";

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
// Preserve original global handler (if any) so RedBox / native error UI still appears.
const _prevGlobalHandler = (ErrorUtils as any).getGlobalHandler ? (ErrorUtils as any).getGlobalHandler() : undefined;
(ErrorUtils as any).setGlobalHandler((error: any, isFatal?: boolean) => {
	console.error("Global error:", error, isFatal);
	if (_prevGlobalHandler) {
		try {
			_prevGlobalHandler(error, isFatal);
		} catch (e) {
			console.error("Previous global handler threw:", e);
		}
	} else {
		// Нет предыдущего обработчика — уже залогировали ошибку, не пробрасываем
		// чтобы не вызывать перезапуск JS-потока в Expo/DevClient.
		return;
	}
});
registerRootComponent(App);
