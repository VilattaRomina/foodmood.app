# Configurar CI/CD con GitHub Actions y Expo

## 🚀 Configuración automática

Tu app ahora se actualizará automáticamente cuando hagas push al repositorio.

## 📋 Pasos para configurar

### 1. Configurar Expo Token

1. Ve a [expo.dev](https://expo.dev) y entra a tu cuenta
2. Ve a **Account Settings** → **Access Tokens**
3. Crea un nuevo token con el nombre `GITHUB_ACTIONS`
4. Copia el token

### 2. Configurar GitHub Secrets

1. Ve a tu repositorio en GitHub
2. Ve a **Settings** → **Secrets and variables** → **Actions**
3. Clic en **New repository secret**
4. Nombre: `EXPO_TOKEN`
5. Valor: El token que copiaste de Expo
6. Clic en **Add secret**

### 3. ¡Ya está listo!

## 🔄 Cómo funciona

### Updates automáticos:

- **Ramas `feat/*`, `dev`, `development`**: Update rápido (2-3 minutos)
- **Rama `main` o `master`**: Update + Build completo (10-15 minutos)

### Qué hace cada workflow:

#### `expo-update.yml` (Rápido)

- Se ejecuta en ramas de desarrollo
- Solo publica updates de código
- La app se actualiza automáticamente
- ⏱️ ~2-3 minutos

#### `expo-deploy.yml` (Completo)

- Se ejecuta en la rama principal
- Publica update + compila nueva versión
- Envía a las tiendas automáticamente
- ⏱️ ~10-15 minutos

## 📱 Ver los updates en tu app

1. Instala la app: `npx expo install`
2. Inicia en desarrollo: `npx expo start`
3. Los updates aparecerán automáticamente cuando hagas push

## 🛠️ Comandos útiles

```bash
# Ver el estado de los updates
eas update:list

# Ver los builds
eas build:list

# Ver los canales
eas channel:list

# Publicar update manual
eas update --auto

# Build manual
eas build --platform all
```

## 📋 Estructura de canales

- **development**: Para desarrollo y testing
- **preview**: Para reviews y demos
- **production**: Para usuarios finales

## ⚡ Tips

- Los updates son **instantáneos** para los usuarios
- Los builds solo se necesitan cuando cambias dependencias nativas
- Puedes ver el progreso en GitHub Actions
- Los updates funcionan aunque la app esté cerrada

## 🚨 Troubleshooting

Si algo falla:

1. Revisa que `EXPO_TOKEN` esté configurado en GitHub
2. Verifica que tengas permisos en el proyecto de Expo
3. Revisa los logs en GitHub Actions
4. Ejecuta `eas whoami` para verificar autenticación local

## 🎯 Flujo recomendado

1. **Desarrollo**: Trabaja en `feat/nueva-funcionalidad`
2. **Push**: Los cambios se actualizan automáticamente
3. **Testing**: Prueba en la app
4. **Merge**: Cuando esté listo, merge a `main`
5. **Deploy**: Se compila y despliega automáticamente

¡Tu app ahora se actualiza sola! 🎉
