/**
 * Dégradés « grain de métal » : une sphère éclairée en haut à gauche. Servent de
 * pastilles de matière et de nuancier, en écho au nom de la fonderie.
 */
export const GRAINS = {
  orJaune: 'radial-gradient(circle at 32% 28%, #fff 0%, #f8e7b0 10%, #ddae52 42%, #93681f 78%, #5c4013 100%)',
  orRose: 'radial-gradient(circle at 32% 28%, #fff 0%, #fbdccb 10%, #db9b7c 42%, #934f3b 78%, #5e2f22 100%)',
  orBlanc: 'radial-gradient(circle at 32% 28%, #fff 0%, #f3f1ec 12%, #ccc7be 44%, #858078 78%, #55514b 100%)',
  or375: 'radial-gradient(circle at 32% 28%, #fff 0%, #faecc8 10%, #e0bf7e 42%, #977438 78%, #5f4a25 100%)',
  argent: 'radial-gradient(circle at 32% 28%, #fff 0%, #fafaf8 14%, #deddda 44%, #969591 78%, #62615e 100%)',
  platine: 'radial-gradient(circle at 32% 28%, #fff 0%, #edece9 12%, #b5b2ac 44%, #6e6b66 78%, #45433f 100%)',
  cire: 'radial-gradient(circle at 32% 28%, #e4defc 0%, #a99deb 14%, #6151c4 50%, #392c8c 100%)',
  resine: 'radial-gradient(circle at 32% 28%, #fbfaf8 0%, #e4e1db 14%, #a9a49d 50%, #6e6a64 100%)',
} as const;
