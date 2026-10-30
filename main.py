import json
import os

import decky

# steam UI localStorage drops writes on reload so keep settings on disk
PATH = os.path.join(decky.DECKY_PLUGIN_SETTINGS_DIR, "settings.json")


class Plugin:
    async def load(self):
        try:
            with open(PATH) as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return None

    async def save(self, data):
        os.makedirs(decky.DECKY_PLUGIN_SETTINGS_DIR, exist_ok=True)
        tmp = PATH + ".tmp"
        with open(tmp, "w") as f:
            json.dump(data, f)
        os.replace(tmp, PATH)

    async def _main(self):
        pass

    async def _unload(self):
        pass
