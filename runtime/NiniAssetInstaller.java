package local.nini.doki;

import com.intellij.openapi.application.ApplicationManager;
import com.intellij.openapi.application.PathManager;
import com.intellij.openapi.diagnostic.Logger;
import com.intellij.openapi.project.Project;
import com.intellij.openapi.startup.ProjectActivity;
import io.unthrottled.doki.stickers.EditorBackgroundWallpaperService;
import io.unthrottled.doki.stickers.EmptyFrameWallpaperService;
import io.unthrottled.doki.stickers.StickerComponent;
import io.unthrottled.doki.themes.DokiTheme;
import io.unthrottled.doki.themes.ThemeManager;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.concurrent.atomic.AtomicBoolean;
import kotlin.Unit;
import kotlin.coroutines.Continuation;

/** Installs every bundled Nini sticker and wallpaper listed in one generated registry. */
public final class NiniAssetInstaller implements ProjectActivity {
  private static final Logger LOG = Logger.getInstance(NiniAssetInstaller.class);
  private static final AtomicBoolean INSTALLED = new AtomicBoolean();

  @Override
  public Object execute(Project project, Continuation<? super Unit> continuation) {
    if (INSTALLED.compareAndSet(false, true)) {
      installAssets();
      ApplicationManager.getApplication().invokeLater(this::refreshActiveTheme);
    }
    return Unit.INSTANCE;
  }

  private void installAssets() {
    try (InputStream input = getClass().getResourceAsStream("/doki/nini-assets.tsv")) {
      if (input == null) {
        LOG.warn("Missing /doki/nini-assets.tsv");
        return;
      }

      Path assetRoot = PathManager.getConfigDir().resolve("dokiThemeAssets");
      try (BufferedReader reader = new BufferedReader(
          new InputStreamReader(input, StandardCharsets.UTF_8))) {
        String line;
        while ((line = reader.readLine()) != null) {
          if (line.isBlank() || line.startsWith("#")) {
            continue;
          }
          String[] fields = line.split("\\t", 2);
          if (fields.length != 2) {
            LOG.warn("Invalid Nini asset registry line: " + line);
            continue;
          }
          copyAsset(fields[0], assetRoot.resolve(fields[1]));
        }
      }
    } catch (IOException error) {
      LOG.warn("Unable to install Nini Doki assets", error);
    }
  }

  private void copyAsset(String resourcePath, Path target) {
    try (InputStream input = getClass().getResourceAsStream(resourcePath)) {
      if (input == null) {
        LOG.warn("Missing bundled Nini asset: " + resourcePath);
        return;
      }
      Files.createDirectories(target.getParent());
      Files.copy(input, target, StandardCopyOption.REPLACE_EXISTING);
    } catch (IOException error) {
      LOG.warn("Unable to install Nini asset at " + target, error);
    }
  }

  private void refreshActiveTheme() {
    ThemeManager.Companion.getInstance().getCurrentTheme().ifPresent(this::activateAssets);
  }

  private void activateAssets(DokiTheme theme) {
    StickerComponent.Companion.activateForTheme(theme);
    EditorBackgroundWallpaperService.Companion.getInstance().activateForTheme(theme);
    EmptyFrameWallpaperService.Companion.getInstance().activateForTheme(theme);
  }
}
