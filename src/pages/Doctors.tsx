
import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, MapPin, Calendar, Clock, Search, Phone, Award, GraduationCap } from 'lucide-react';

const Doctors = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');

  const doctors = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialty: 'Cardiology',
      experience: '15 years',
      rating: 4.9,
      reviews: 127,
      image:"data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUSEhIVFhUXFRcWGBcWFxcVGBUWFxgXFxUXFxcYHSggGB0lGxcVITEhJSkrLi4uFx8zODMtNygtLisBCgoKDg0OGxAQGy0lHyUtLS0tLS0tLS0tLS0tLy0tLS4tLS0tLS0tLS0tLS0tKy0tLS0tLS0tLS0tLS0tLS0tLf/AABEIAR0AsQMBIgACEQEDEQH/xAAcAAAABwEBAAAAAAAAAAAAAAAAAgMEBQYHAQj/xABIEAABAwIDBQUEBQoFAwQDAAABAgMRAAQFEiEGMUFRYRMicYGRBzKhsRQjUsHRFUJicoKSorLh8DNTk9LxFhd0JURUwjQ1Q//EABsBAAIDAQEBAAAAAAAAAAAAAAACAQMEBQYH/8QALREAAgIBBAEBBwQDAQAAAAAAAAECEQMSITFBBFEFEyIyYXGBFCRSsUKR4SP/2gAMAwEAAhEDEQA/ANYpC7OlL0hdjSolwPHkyDaPFHkuPoTcLSgKV3QQAJAMczJNV62fR9HOZ1ecSEpzKjoAN0VPbR7LXbt06tthRSVCDIAOg5mmzHs/vjvbSPFQrsYZYowVzS4fX+jn5veObqPqiAKzukxykx6Umqroj2c3Z3qaH7RP3U4R7MnT71w2PAE/fVj8vCv8hVgyehRQKu+wN6pby1uEqPdG4DnwA6mn7Xs1SPeuvRP4mpzANkmbVWYPKUTG8Dh4Vk8nysU8bSe5fhwzjK2WRrEAVZQlXjpFOzv8qiEWTQKzmWc+8E6eXKnqblIAAB0EVy1P1Nrj6Dsn5UYmmRu+lcN2eQoc0RpZIsGjGkbJciaIb1MkHShSQUKrMRFOGt5pip9JIgg09Z3mhO2DWwrXK6a5VggK5Xa5UgCgaFCgDkV2u1yggZUjdqhM0sKSuRpST+UaPI3s0Zk5iTrQdtjwUaVsRCB50u8qQOlRGK0oZt2V94qCopZAUeFcvE98VJBNVRjbZY3shgG1cqMGlU9y10CrNCF1MaBg0YW5507Ao0UaURqY0Ft1o30anaN9dVqZqdKC2GskwIpq4wJOnGnrFJqGtQkFjVDQBGnGpVneaYqG7xp6zvNC5B8C1ACuUYKqwrZyKGWjZqANABK5Xa5UgChXa5QBHg0R/dXELkTXXDpSS4GjyC192jLotvuoy6mPBD5KxtetaWHFNmFBBM8ucdazfYvbRy2f7N9xS2lmJUSooJ4yeFapjtp2rTjcxnQUzykb6ynY/ZAXV08lxyOwWBAHvgE6684quPLHl0bGbkaRuOtOmzNRz6IMDgIp7ZjTWnIHAFdiorHdoWbUd8yreEJ1J/DzrOMZ9pVwokNJS0nqMyvjpQCTNdAo2WsHa27vM0/SCehA/CrvgXtE7oNwmRuzJjf1osmjRWqBTTPCcUafEtqnmOI8RT5CdNaEQIODd406Z3mkltzSqDFRW4XsK0KJ2nQ1ztehpxQ9Ck+16GudoeVACtCabvLUQQkQY0O+Dziq5dbOPuj628ePLJlbAP7I186kC10Kpv8A0g9/8649R+FCggdWt04o99AHUKkVIpVpUNaLlIipW3OlVvgaPI4Y3UZdFa3V1dTHgHyRmItlQKQSCREjhVQwPBFM4s5ncKu0aDiTomcpiCBvifjVoxtkqQrKJUEkpEkd6NN1UHYN5xeJufTJS8loBCc5IGskDXlGlJHljPhGkXXvVGbabSIsmgUwXF6NpmdRvUeg09RUrcua1hG2GOG6ulrnuJJbbHJCSdfMyfOnIHCMQW8sqcWVLUZMniflTTErMjUnToP79aaWjkQPl9540/vHSoAAev3DfUjFeeQAeNTmBAODs1EwqBy46HxpmjALhw6Nrg8dY+NWnBtkltiST4dfOqpZIoeGOT6Gmz20a7d0IzkFPuq6fZIG8Gtw2Vx9u8azpgLTotP2T+BrF8T2TdKy42rvb43eU1YPZbiakXhacSUqUkoVJnvDvCOe4+tPDImLkxtcmxpFcjpXa7VpQFoV2K5QAKFCuGgAUJotCgA00KLQoAqrIAOlSVuNKh7VwQI3cKkQqUKjfFVPgePI7adHAzXVup50zwMfVa8z86fupgeNEbpEvkruP5HBkF52B4lOUqjl3t1V/DNlbRp1L301a1pVmk5TJ4yQKU2sa+uHUfhTtvDYAA5UkbtjNKibvb9hSVfWcDu8K83rUZj/AJ/pW3Yo2llpbiz3UpPnyA6msmRhiZzK0BGaBwHH7hT8chV8HbBuO8Ty8p0H99K1rY3Z1tLSXVpClKE6isy2fsTcPhobipJ8AOHoK2p24QwhIUTMd1KRmUQOSRwqjI7dGjEqVguUp3ACKZqpFGPMLXklaFExC0FOtOH0xOoMcRWeSZpi0MlaGoV5oN4nbr3JdKR5zkP8wpXGcfbY97U8BIA81HQVW9qcacKbR9RakPnIGyTAGRSwTx91G7nVmJO7K8zVUeggKEVxpUgHmKPFdA5gma5RyKKRQAWuGjRRaAC0K7XKABQoUKAKNZMhO7dy4eVTVunummTTMGpJpOhqlrYdckPf4e66hDTT6mTnUSpIBJAB018R6VW02N2q/Nm5iDxQljtApIQk6mI93pV5aH1iP2vlUClP/rav/EH85rRik1Fr6egmRb/khhsQXnXg5ePnsyADInVIVrpWZX+K3Lbq0C4c7qikd48DFb7h3+PdfrI/kFYNiFko3Lqyk5O0Xrz7xEVpxTuMtXVFM4u0o/UF5fvqZh11a5MgKMgcBpTXErmAkDSRJO/doB8qd4ju8Khscc0CeAH9/wB9KwSep2bKpGh+yO0lZcP+WSByBUAD/Ca0LHsOecRDDiWyYClRKso4Dr14VS/ZktCVBtKgV9kCQDJyk6H1+daag6VkcrkzVFVFIyVeBXLTqlJU8pecFCiSQlI3yn3VE9RHyrRrO1V2EuarIk7hr5VzFMSQ2OZ5Uta3yezGY6lMnQgSeANK3bLFFpbGc43sY49ddsDmykKSlR0EQQI5Uz9oGzwatrZaU5SLg543S6kZiBwEoGg51csQxHKtBSeYPkRBn19Kj9t7sOWKgrf2jUeIWCfgFU0J70Lkx7Nmj7J4gHrVpYMnIAfGKmKyn2WYvlhsnuq4ff6D4Vq4rbF2jnzVMKaKaOaLTChaJShopoATNCukVygAUKFCgCDRbK4ilUDQ0raPpVu5z8SaSnQ1W+Bo8iSP8Rv9r5VBx/60f/EH85ou1eMuWzbbrYSVdoUwqYgpJO7wqg3G2Vz9O7dKW85ZybiRl97xnWtGDE5RbXoJkmk/yaph3+PdfrI/kFY1dIPbu8g4s8t6jU/h+210FuqKGznIJ0IiBA41WMVxCSrdJkmOtRkvGnH1ofGtXxfcYXqgSI/vdTDFrI6yCPh/e+jtP5lpHNXwFTON36bh1QAIGUI1MnedSeOh/hrMW8jT2fYkWsQt1GEp1aX4LHdJ/ay/CvQTq9NK8tWzpCoO8bue/n41sOw+2ocQlq4MEAAL4Hlm5Gqcy7LsD6JQWNwp+ezQtMn3lkEDhlTEK8yKkcWBy5VKbHQgjjHCeGtTKGgdQfOm1/YJX733VStkalNXuUjEEPlP1akZAde6CVGRuM90b+E+FQW2t5lSzagyoDtV9NMqB8V/CrzfutW7S3FqlLaSeEk8AOpOlYkq/W86t5fvLKleHAAdAAB5U+ONvUV5si+Vdlw2SxMtPIIEjMndr4/CRXoTDLgLbSoGQRv515pwi/Sw6HCFQREAwM2+fDp1rWfZptGVthte9Jy+IOoB6ifTwrVB9GKavc0Y0WjJM1wirUUhTRDRzRVUAFNcy1013MKACZTyrtGzDrQoAyzAsR1BWXFoAGXKJTHMga1dWXApGYbiKy3Ze3daWSicyNcvBaTvHjWnWVylTecbiJ/Gs8X8JMeSl+1AxZoMx9cPkay1hBKwomND3q9BWriXkkqQkjMYBE7uNR+N2rCUatIiddANBKj6wB51uw+X7vFpS/JXPBryam/wY66rKmd33+NRL8lJVVrvrN26eIaZKzGiUDQDmTuAniY4VCY9hyrdJbcgK3lIMxx1NZHNzepmyklRXrVf1k8gEjz1Pwp+w5Ls8wR94phbjWep+GlOGV94DiM00MrRHXghxXjVk2XVJIqDuWcy/E/81N4M2WlBR9wkAnkSJAPiKryq4FuLaRpmCX60IgKOnDeKUuMadWoIQnMo8Nw8+QpnYo7o67uvhU/glkAhS/ziqPIAH7/hWXHFzlRsnJQjZWNqbdRaKFqBVBVAHdBjSOfiazBtvvryDugnwGmp8M01fts8TM9i3q66SBH5qdRPz9CalsD2EyWxSYzFMnxIroKCqkYJTt7mWIUoggHfoQeY5z6VY9lMRubZYJaUpOkwCdB19adOYEGn2s6YS93Z4ZxGhHOSPWtV2fw6GgAe7wga+tCgRqF9mtt7d0BOfvDQg6fOrg2+lQBSdDVbcwJlyC42CoaBQ7qh+0NadYfZKZXCFZmydRuKTHGND4jnTJPsrddE5RDQSqaBqRQpopoxopoA5QoUKAMywUd+TvgCRxirSyAltcaCCT99U3Bs6tM6kjKFJ0G48DVrYJ7JwEych18qzw+UaBX8N2vbbbOZl+JJzBtWXLzzREUa/wAUTfND6MkkBJcWqUnIgJEyJ0JmIjePOp51I/Jh0/8AbH+Sq37HrhKLRwkCJcJ8Br93xrW4w0bL6cipy1bku0+1YWhyj61Sc6uZncT0ggCsV2wxYuuFR3q4cqtW1+LpUpSUqzFMzG6TpA6dPwrPywXXQCd/9geH9Kobvbovql9TtuiEonjM+en40uICyo749TEH4yaM+1C0pHAgDyNKNNZlAR/Z/wCBUWFDE91YzD3tZ8TvFarsFhiHGyFJSQtJMKGaNwTod5ACfOqJjWGTbl1I1aUCo/onu/18AatmzNw4u0PYR2qkFKZMDP7p1+MeFNFWQ3RcsGbSpKQEpKQVpiJI76tB9kafKpxJDbK1qSkJCCdwGoSk/jWIYS9cYe8A62tIPvIV+cPtIO4kcwelahtbZqdtww2QCUj3hIEkEgjiDrPlVmTxHikn0+GRHOska77REYZhrYe+mPpAMuJQkJ7yj2isug3gJCfKrrh2ISO8y6kHiUj/AOpJqK2QwheVHaZSUCO6kISCTmISkbhJNW1xrUcKlCGX+0WAgZYhDgWPFUz8q0HZgTbJNZ77VdbhlpIIS6tIBG4qB3DrCifTmKksQxhbWVpqZS2A4RuQTr5qiDHWq8uRY1Zq8TxJ+VPRD7mhdokcRRGn+8YIgnnWTX+OPKaJauE5kpywqQoifeiYJ5mn1htU7oFuJZmPzSoDQTGogTWb9VudN+wc9OujV2lcaVJqsYNjUrDTi0lRAyrT7rhjWOWp3HnVkmtMJqStHFzYZYpaZBjRTQmuUxUChXK7QBnWDsf4ZAEdnBjiRBqaZ9x39Q0lhtsEJCRyp0UQhz9Q/KqUqQ8RN3/9Yf8Axj/JWb7JXikYesN7yXU+iSZ+E1eF43bnDygPIz/RyMuYTOWIiqZ7N7Tt2kskiVKuRr+k0oA/Ca0tNQf3Ei1q/BFYTg2ZpVw/uKFKSDxJjKonwM/Cqw44e0zZQDqYHTQVpaMPKLElWoTLRTxGWUKA5wpJEdKzuB3lEjjpyJI0qhqkaBpbqzKJPAQPvPz9Kn8Lw/MUqSNCQPh/zVfbaJUI3EEeuv41tGz2z4bZTmgqKTBE7zvMHXp5dahK2CdCWzOAJdt3EOJ0dSoK8FiNPKPSqdsLbqZuHLJ0qCm3DoCU5lI0JnfCkFChHKtpwmxDaABugCs19qWGqtrpnEWdMxDbh4BYB7JR6FOZJ8EjjVtFTluVzajExc4n2YMttONsDlOYdp55iR+yK1W9a99fL8NPjFYJh97kUlSt4WFK55wZUTzMivQt6kHs2/8AMWFH9UGfwroeXDTCCT6Zl8eTlKb+pK4PbZGk8yJpW43Uu2IMUjdVhNBWLxhK3cqgDBSQN8HiocjGlU7FrzIh9qIcS84SeMFRy/CK0GyYzOk9ap3tIwkpcNwgbxldA5fmq+70rL5Xy2d/2BkgvI93Puq+66/P90U3A3UJfCnNUiT4mNKRxa+7VZVEDgOlNSateymzcj6VcphpOqEnTtDwJH2fn4VyVcvhR7fysuLx08831S/59R1s5auNNtLfISArO0kA9orRUA6QkGRvqNxnH7q3fPZXDyUr+sCFHMEBRPdGacydDBqyW6VXVzJPdSTu58fIbvGaQ9p+GAlhwAAZVNH9kgoH8SvSu37NXxU+D5r7bzvN8VfFzt0Rll7TLtH+IG3B1TlPqnT4VZMO9prKoDrS2+qSFp+41mv5P1jN99NEqrsvx8cujzq8jLHlm9/9R23+cn40KyP8iPfZV8a5Wb9Nj/kaf1GT+JqLIpS4H1a/1T8qKymlnW5QpI4pI9a5z4N65MIQ8jKU5ZJ01G4hXvA+FWv2Q/8A5bc8Uu5f3T900Uezm4CiQ42d/Mb6f7B4U7b3rOcAgdqkEH87s1SfDWPOt3k5cbSUHZT48JK3JUWvbTDwlEp3F3OQORBLnyJrFr/DSH3UDTvOCPWPur0PjLHaIKVcj5TIPjIJFY200VuOOETCu8eWZCQvwiSf2axzRpg7RUMJ94A7489P+RW0bA4gt5stumVoWdYAlKu8kwOoVWTXVv2VwoEe6qf2SfiKvOxd+BdIymAtJBHJSd3z+NRDkmS2NWaPCo/ajBU3lq6wrTOnQ/ZUDKFeSgD5U+KtARS1quRFWlJ5ZxuzcaUtLqChwHvpP5qxorxBEKnjmmt82LdU+ll1YghhskHgSgGqd7abdtVxaoUACpKitW49mFtpMnoFLPlV42Kt3yh1TrZaHbOpRmEZm0rIbUBvgpjlNX5MmrHFegkI6XJ+pZ0GTSF2daeNoCRULj912QDp9yQFfok6Anod3pzrJkbUbRdjScqF8yRruqPusPCte07pGqVDMD68OlRIx/tFZEIKp3ZdTHhTO5v3AVI7wyzmBgkRvrHero2xTi+aI5eDWDbpVlUqDOQq7s8gAN2nEmnOL4it8hCARroBw6/hUablome8Y4RpUnsrmduYAhISonrIyj4kVXCFukqNnkeTOcdU23XqyY2fw8MJjiRr06Uhty0F2s8UOJV5KlPzIqSaMaGo/apJ+hOkc0T0HaJrq4YqMopHCzycoybM2UuBP2Z+FRuD23aPNN/acSn1IFOsRV3D1gffUh7OrbPftckZlnySY+MV2G9MHI41asiia1+SW/0vWuVIxQrhHbojkJo6tx8K4kUZW40suBlyIWWqTPOo20Zl5EaKDxV+yc0+OhHpUnaDQ+NGKocaUBuMeIP9mohwiZcsV2ivuxYWuJUAQkfaWe6keaiKr+yuBhCSFpCc6UkyZk8/gKmcatVOvtN/mAlZPPKCAPVU+VOmMMQJkZjzOtXVuQnSoy/bPZc++jUoJEjin82eemh86rGAXxQ8hQ3j3hx0jdzP98q3m4skEEZYkRoI+VZhtLsU6Hg7bIKllW7LGbx3JB66Uko9oeMr5NJwe8S4iJ1ifEcCKcW6ylcVE7MYE80lHbZRAnKlRUR0mI9KtbSgRI0qyypkVc7OW7tyi7dRncbRkbCtUok5ioJ4q3andGlSwVTbtiDrQXcRqaggVuFRqTAqGv7lLqVNwMhBCp4g02xS+Us9BwpsyeNQMlQMIU1bIKEIhQ0UreV8iT4cN1V7FWXfr3UJKs2YgpEnWTEDXlUziqZ78xpBG4Hl50hgNyQspnr9x+6ilwixS7KXs3ZruDpISPfUQYEGCBzPStHwSyDJGRPdOhVvJ5E126X3jrSttcJCRMzx060igkyZ5HJEjf2WbvAa/wAwps7h/bMutHTOkpHmDB9flT20vUqTGsgcfKuWTwJIHAn5mrE2UP0MCxgFMIOhzGR1Gh+dW32Q20vPOfZbCfNSp+SahfaPbdnfOAblAOD9vVX8Warn7IreLZ1z7bkeSUj71Gupnn+3v1OXhj+4r0LzFCjRQrkHVI4UF7q7XF7qWXAy5E7XcfGnFulOdJVuBOvIwQDSFtuo66iHCCXI/uYkLSZKT4TpBE+frFLMK5pg9YpjarlMcUn4cKkm3Oe6ruRALgb+Og6k0XJr0pBpWY9ofBA6cVefy8aF1cBCMx46CgA4dlZpZBg6bjvqJbuJ1HGl0uygnfUkje+vpWUp9fwodvDJJ4VBLdOaetRu0O0Tdu2VuuZUzA4yqOAG/jUE0SJczK6UW6xBKO6NVcvx5VBNXy1gZO6CN/H+lOre2giihjqwtZzKM8uQ8BRA8G3ELOgkA+B0P99Kkw1pVexhrMCKATLYqgKjsBuy4wgqMqAhX6ydD8qeFcVADy3dykH1pbE7ZYOduOu/yOlM21az51LIu5SAN+XXoeHymhCszD2jHOlp1acrqVKaV+kkSpPpr+9V69ndvkw9n9LMv1UY+AFU/wBqrZWGHAQBmU2U7pUoZkq691MdI61o+Bsdnbso+y0gfwia1ZZf+EV9WZIR/cSddIfUKFCsZqE/oPJXw/rRHLBUaEfGpLLXclS0mRZEM2Cxvj1o6rFfIeoqUVA1Jjx0pqvEmRoX2h+2mfnUUkibbGLNm4lclPdIIJkeXGlrtpwtkNgZjG8wInX4Up+VbUb32ieq0n79KWTi1udz7X76fxqFJLhk0/QSVbuTOnrUbjmHvrIyJkAfaH31Nov2TudQf2k/jSqVpO4g+BFNqI3RTLazuEGFNKjyPymuYji4t2lFzuCPeV3QPWrqVDmPWiOqREKKfMj76mwsxHEPaBaIByKLqvsoB+KiAIrNtp9oHLxwLWAhKQQhAM5ZiTPEmBr0FejtpMNwwtKddtbZ0gd3uIzKJMABYEjU86y+4wdthZcTbttgmRk7+XwKyTVsJRW9biytkzssvPbMrOhLaZnmBB+INWBpSPtD1qsYbitsZCnkyOE6+QoXW0DYB7NoqABJJnQDeYHCkbHTL1ZoQreQR41XcSahah1NUZe37QOhT5IPzqWtNq0ujMYUPtJOo8QaRyQIlNmlFtbrZOhX2iRySoCf4wv1qyE1QMRxPI6082ZEEGN8TqCOdXOxuw4gKTxFSMSVs5EkiRBpub3LmXO4SR14AUS6fyoEcSaYvuJS3nWQEJJUrwG776KsCI2yczv2tvxKgs/wpT8l1rATGg4aVhmzd2q6xNt1fFwEDglOYQkeAPzrdKv8iOjTD0X9mXBLW5T+v9AoUKFZi8htqtvLSylKlZ3R/wDzTqRu3nhoZ1rO77bTFb0kW6fo7Z/OGhjUe8ROoI4cN9aRcbIWq3lXCmwp1RBKlEq3AAQDoNAN1ODgbX2RWfJLI/lLYKC5MgTs2pZzXb7r6uIUtRT6E61JM2KUDK2hKBySIq+XaLNswtxtJ5ZhPoKVbsbdQBQUqBEjKZ0rFPDlm92aY5IR6KD9GNKtsGrwbBiYlE8swn0rv5Hb4D0pF400x/fxKWGjRXLB1UKS5kB3AD5mrfd4c02krWQlIEkkwPU1WE7QW5KGw4AVaJkFMwJ49K3eLiabcjPny2qQwXY3AIPaBUHiJ+dGuH7o70tnqAAdOVSybpJG8GiqcSa3GSyibTYlcBHZBhZBiVgkhOsiAOOlVK7xa4iFOLjr/wAVr7gBMSB1O74VGPpaUpbYUhSknvAQY5UAZTgVwpVwBlK1E6AbzVqv7S7XAQoW++T2kKI3RCOFONocjRbCQEkrkkCDCRPDyqJexqd1VvZjIbo2OQPfuP3UE/M06s8DaaMouXBO8ZUwfKaTbDyxmyqynceB8DxPQa09scNIVKlFWbdvSlIkD3iJ67tIMioCkO7NorcCUKVCN4Wns9TqChSTqdDprFWuxe7NorJJyrhR390neecEpHnTrZRKltpbDSCkGFSkKbcRqQpRkgrBO8fCr01hbRbDamkKTlCTKRqOtCmr3GadbFCfx63KZLkxwCVSfUDlVO2oxZTqQkDKjNumZIBgq9N1bC9sRZOT9Tl/UUpPwBioy49mVooyFu6GQklKkzrwgE7+dasWXDB3TM+WGWaq0Z37MUj6YlatEp3qOgG8793AVuLbqVapUD4EH5VVf+iFpENvJgbgUFI+BNNl7K3adwQr9VWv8QFV5sqyS1DYsfu40XeKFUP8h3v+Sf8AUT+NCqtiymTVztYo6NoA6q1PoKa3NtdvJzvOFpriVqCB+6NTUQxiDrIUWGUuOkQkqg5P0tSBVXxPBcQulZ727Ak+6FSR0ATu+FN7tPkjU0TeJYzhdn7yjcufZGiZ8BvqEuttsRu+5as9i0NO73e7yzeHWn+HbLWzOoRnVzXr8KfWcrfUj8xLc5dwzEiIA6TUqKXCC2+SAtbNSUgLylW8lIga8Nd/jTpt1xPuqUn9VRHypTEnHG4JbSNTIk6AdfCo61xnMspUlCQJ3qjd5RVDxS5LVNBtoNobhDae0cUtrvJUDBIzJKQpJ3yJNVG6xW2WsKIJGbUEAkoQghA8c0E9KsWPOJcSMsEDMFQUnQjeNdD+NVRWEa6J4n5aGrcUNirJLcJZXaU9l3lpAQtxzKpSZJJyJEHdup7b7QOISn65ZIZUTOv1ij3Br0pscHEGAZyJjx/Omm7uCncJ4Dj61ZpZXqJ5e2CgAO01zNgnLwUPrI6gzpUdabQlD7rgQClS9V8SkZoEcOFRgwgnSDvGtc/J/dIk6q3ddaNLDWiTOJruSEqZKnZV2ehjLvjKN+ka9KmLTCVgwtCG1BCTAGYuBU5FIA1CwRrFQVh2za0OIcUCiQDM5QdCINWTCNqbtn3eyUCSrvoB8TIIIpXjmNGcSZsdl7h2MiCAdVLWYS5u73ZxoZzHcKvOHbFNAEvfWqVGYq3GNB3dwiqux7UHkJlxllXPLmT85mpXDfas2v37ZadJ7qgr5xVTxy7LVNdF6tbNKAEpSABuApyluq3ae0CyXvUtH6yT8xNTVrj1s57jyD50uljMfpTRgmiNXKFe6tJ8CDSpqRTgTXYps9iCE8ZPSmD2LKPuiPiahtE0yZoVXfp7n2jQqNQaSsCxc+yfhxMc+dMbsgb99ZuParf8md8/4Z3yVfa5mkLbbK/uHEtNobW4tUJSlGpUeA71XtlSNNddWnckK6zFRKLxzO4pA7NfZx34ynVPLjoaoSfaFeRH1X7h/GmN9tdcOiFZN86JI++pUkBar7FVlORajmBmTrJ468qhVuanvTzqGfx91W8I8h/WkPyo5+j6U2tENMsDKwCCRpIq8Mu27hHaQJAEHukbqyb8pudPSnd7tG86rOrLMBOgO4TzMk60a0BqN3svPeYcBTyUd3nVbumsiihSkyN8GR61WE7XXQbLYUAk6HTWOUzSdttM8iQA2Qd4KZn41OtEOJZHHADB18NaKFjoKqpxt3kkeA/rRFYu4fs+n9aZ5I9CaX2WhQzaDXXhrSbwybxJ5fjVaaxVxJlJAPn+NHVjLh+z6f1pfeInST1raOPKA39OQ8KmUWoSnKPM86quGbVvsLzthuYjVJ/GiHah8mSEfun8aSUrLYUuS3MoJMJBJ5ASatGBbPXOYL0aH6Wsj9UVnth7RLpkQ23bjr2Zn1zU8/7r4hyZ/wBM/wC6q25dFmtGyYbg7bJz6rXMydAPACpG6vTErXA6mBWFf92L/kx/pn/dVdxXaO7uVEuuKVxy6hIn9EcPGl0uT+Jka0lsjfrfaS3cdDTbgWrMlJKdQnMY1NWVqy4mvLmDbRv2ys7WWQUq7yZ1SZHHnVsHtmxLlb/6Z/3UzhFPYVTbW5vf0T9GhWCf95cS5W/+mr/fQqKDUZ1W2eyjFrVmyaS9d26ZeKyhbjbSm1JuGCkqSe8slAWc5ICUiAN5rE6FMKehrLaC0aatx9NtSpBt0BYcZH1Rdw7tAGwB2KQkPjJqQEKUTJMGv75i4sXVNOsuKbtLouZCgkTarQn3eUDw05ivO9O7fFH221stvuoaX77aVqShfDvIBhWnOgBpQoUKABQoUKABQoUKABQoUKABQoUKABQoUKABU3gGGLVDyLi2bUFKSA84EKnLqcpERB3nQnTfpUJQoAuBYeUC2q6siFN5ysLRMGQEbgc5mddQBrEwoXVhcHO4Ly0UUpOYIc4BcCJTGq4gzpmEwN1PoUAW3EmH+zcz3lmsZVHKlfeOqpCYSNe5xOoI4k1UqFCgAUKFCgD/2Q==",
      education: 'Harvard Medical School',
      location: 'Cardiology Wing - Room 201',
      availableToday: true,
      nextAvailable: 'Today 2:00 PM',
      languages: ['English', 'Spanish'],
      bio: 'Leading expert in interventional cardiology with extensive experience in complex cardiac procedures including angioplasty, stent placement, and cardiac catheterization.',
      consultationFee: '₹2,500',
      achievements: ['Best Cardiologist Award 2023', 'Published 50+ Research Papers']
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialty: 'Neurology',
      experience: '12 years',
      rating: 4.8,
      reviews: 89,
      image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
      education: 'Johns Hopkins University',
      location: 'Neurology Department - Room 305',
      availableToday: false,
      nextAvailable: 'Tomorrow 10:00 AM',
      languages: ['English', 'Mandarin'],
      bio: 'Specialist in stroke treatment and neurological disorders with focus on innovative therapies and rehabilitation techniques.',
      consultationFee: '₹3,000',
      achievements: ['Neurological Excellence Award', 'International Speaker']
    },
    {
      id: 3,
      name: 'Dr. Emily Rodriguez',
      specialty: 'Pediatrics',
      experience: '10 years',
      rating: 4.9,
      reviews: 156,
      image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
      education: 'Stanford Medical School',
      location: 'Children\'s Wing - Room 102',
      availableToday: true,
      nextAvailable: 'Today 3:30 PM',
      languages: ['English', 'Spanish', 'Portuguese'],
      bio: 'Dedicated pediatrician committed to providing comprehensive healthcare for children and adolescents with special focus on developmental pediatrics.',
      consultationFee: '₹2,000',
      achievements: ['Child Care Excellence Award', 'Pediatric Research Leader']
    },
    {
      id: 4,
      name: 'Dr. James Wilson',
      specialty: 'Orthopedics',
      experience: '18 years',
      rating: 4.7,
      reviews: 203,
      image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face',
      education: 'Mayo Clinic',
      location: 'Orthopedic Center - Room 401',
      availableToday: true,
      nextAvailable: 'Today 4:00 PM',
      languages: ['English'],
      bio: 'Expert in joint replacement surgery and sports medicine with minimally invasive techniques and rapid recovery protocols.',
      consultationFee: '₹3,500',
      achievements: ['Orthopedic Surgeon of the Year', 'Joint Replacement Specialist']
    },
    {
      id: 5,
      name: 'Dr. Priya Patel',
      specialty: 'Dermatology',
      experience: '8 years',
      rating: 4.6,
      reviews: 94,
      image: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=400&h=400&fit=crop&crop=face',
      education: 'UCLA Medical School',
      location: 'Dermatology Suite - Room 150',
      availableToday: false,
      nextAvailable: 'Monday 9:00 AM',
      languages: ['English', 'Hindi', 'Gujarati'],
      bio: 'Comprehensive dermatological care including medical, surgical, and cosmetic dermatology with focus on skin cancer prevention.',
      consultationFee: '₹2,200',
      achievements: ['Dermatology Innovation Award', 'Cosmetic Excellence Certificate']
    },
    {
      id: 6,
      name: 'Dr. Robert Kim',
      specialty: 'Ophthalmology',
      experience: '14 years',
      rating: 4.8,
      reviews: 145,
      image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face',
      education: 'Duke University',
      location: 'Eye Care Center - Room 250',
      availableToday: true,
      nextAvailable: 'Today 1:15 PM',
      languages: ['English', 'Korean'],
      bio: 'Advanced eye care specialist in LASIK surgery, cataract surgery, and retinal diseases with state-of-the-art surgical techniques.',
      consultationFee: '₹2,800',
      achievements: ['Vision Care Excellence Award', 'LASIK Surgery Expert']
    }
  ];

  const specialties = ['All', 'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology', 'Ophthalmology'];

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'all' || 
                            doctor.specialty.toLowerCase() === selectedSpecialty.toLowerCase();
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50">
      <Header />
      
      {/* Premium Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-8 text-white leading-tight">
              World-Class
              <span className="block bg-gradient-to-r from-blue-200 to-indigo-200 bg-clip-text text-transparent">
                Medical Experts
              </span>
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed max-w-2xl mx-auto">
              Connect with India's finest doctors and specialists. Experience premium healthcare 
              with personalized treatment plans and cutting-edge medical technology.
            </p>
          </div>
        </div>
      </section>

      {/* Premium Search Section */}
      <section className="py-12 bg-white/80 backdrop-blur-sm shadow-lg border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6 max-w-4xl mx-auto">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search by doctor name or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-14 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl shadow-sm"
              />
            </div>
            <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
              <SelectTrigger className="w-full lg:w-64 h-14 text-lg border-2 border-gray-200 focus:border-blue-500 rounded-xl">
                <SelectValue placeholder="All Specialties" />
              </SelectTrigger>
              <SelectContent>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty} value={specialty.toLowerCase()}>
                    {specialty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Premium Doctors Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredDoctors.map((doctor) => (
              <Card key={doctor.id} className="group hover:shadow-2xl transition-all duration-700 transform hover:-translate-y-3 bg-white/90 backdrop-blur-sm border-0 shadow-xl overflow-hidden rounded-2xl">
                <div className="relative overflow-hidden">
                  <img 
                    src={doctor.image} 
                    alt={doctor.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  
                  <div className="absolute top-6 right-6">
                    {doctor.availableToday ? (
                      <Badge className="bg-emerald-500 text-white px-3 py-1 shadow-lg">
                        Available Today
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-500 text-white px-3 py-1 shadow-lg">
                        Busy Today
                      </Badge>
                    )}
                  </div>
                  
                  <div className="absolute bottom-6 left-6">
                    <div className="flex items-center space-x-2 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-bold text-gray-900">{doctor.rating}</span>
                      <span className="text-xs text-gray-600">({doctor.reviews} reviews)</span>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-8">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{doctor.name}</h3>
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50 px-3 py-1">
                        {doctor.specialty}
                      </Badge>
                      <span className="text-lg font-bold text-emerald-600">{doctor.consultationFee}</span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-6 leading-relaxed line-clamp-3">
                    {doctor.bio}
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center space-x-3 text-sm text-gray-700">
                      <GraduationCap className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">{doctor.education}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-700">
                      <Award className="w-4 h-4 text-purple-600" />
                      <span>{doctor.experience} Experience</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-700">
                      <MapPin className="w-4 h-4 text-red-600" />
                      <span>{doctor.location}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-700">
                      <Clock className="w-4 h-4 text-green-600" />
                      <span>Next: {doctor.nextAvailable}</span>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                      Languages
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {doctor.languages.map((lang, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                      Achievements
                    </div>
                    <div className="space-y-1">
                      {doctor.achievements.map((achievement, idx) => (
                        <div key={idx} className="text-xs text-gray-600 flex items-center">
                          <Award className="w-3 h-3 text-yellow-600 mr-2" />
                          {achievement}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl py-3 shadow-lg hover:shadow-xl transition-all duration-300"
                      disabled={!doctor.availableToday}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      {doctor.availableToday ? 'Book Now' : 'Schedule'}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="px-4 rounded-xl border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300"
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredDoctors.length === 0 && (
            <div className="text-center py-16">
              <div className="text-gray-500 text-xl mb-4">No doctors found matching your criteria</div>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSpecialty('all');
                }}
                className="px-8 py-3 rounded-xl border-2 hover:bg-blue-50 hover:border-blue-500 transition-all duration-300"
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Doctors;
