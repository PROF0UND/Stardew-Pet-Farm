from PIL import Image
import numpy as np

p = r'c:/Users/anuj1/OneDrive/OfficeMobile/Desktop/shrikant/Obsidian_Vaults/SUAS/.obsidian/plugins/skybirdyys/sprites/pets/chicken.png'
im = Image.open(p).convert('RGBA')
arr = np.array(im)
alpha = arr[:, :, 3]
cols = [(i, (alpha[:, i] == 0).mean()) for i in range(alpha.shape[1])]
trans = [i for i, frac in cols if frac > 0.95]
print('transparent columns', len(trans), trans[:20])
non_trans = [i for i, frac in cols if frac < 0.95]
breaks = [non_trans[0]]
for i in range(1, len(non_trans)):
    if non_trans[i] != non_trans[i - 1] + 1:
        breaks.append(non_trans[i])
breaks.append(non_trans[-1] + 1)
print('blocks', len(breaks) - 1, 'starts', breaks)
