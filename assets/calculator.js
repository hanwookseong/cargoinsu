/* =========================================================
   cargoinsu.com — 적하보험 보험료 계산기 (v6)
   ─────────────────────────────────────────────────────────
   v6 변경:
   - 국가 75 → 206개국 (ISO 3166-1 alpha-2 풀세트)
   - 다중통화 지원 (USD/EUR/JPY/CNY/GBP/AUD/CAD/CHF/HKD/SGD)
   - 통화 선택 시 해당 통화의 KEB하나은행 1차고시 전신환매도율 자동 적용
   ─────────────────────────────────────────────────────────
   기능:
   1) 수입/수출 구분
   2) 출발지·도착지 (전 세계 206개국 datalist) → 운송지역 자동선택
   3) 운송지역 (KIDI zone 10) — 보세/외항·국내연안·일본·중국·동남아·중동/아프리카·호주/뉴질랜드·유럽·북미·남미
   4) HS Code(4자리) → KIDI 품목코드 자동 분류
   5) KIDI 해상보험요율서 품목 코드 (201~306) 직접 선택 가능
   6) 화물가액 — 10개 주요 통화 + 통화별 환율
   7) 보험가입금액 = 화물가액 × 110% × 환율
   8) 환율: 전일 종가 전신환 매도율 (하나은행 1차 고시 표준)
   ========================================================= */
(function () {
  'use strict';

  // ─────────────────────────────────────────────────────────
  // 운송지역 (KIDI 해상보험요율서 기준 10개 zone)
  // ─────────────────────────────────────────────────────────
  var REGIONS = [
    '보세/외항', '국내연안', '일본', '중국', '동남아',
    '중동/아프리카', '호주/뉴질랜드', '유럽', '북미', '남미'
  ];

  var COUNTRIES = [
    ['KR', '대한민국', 'Korea', '국내연안'],
    ['JP', '일본', 'Japan', '일본'],
    ['CN', '중국', 'China', '중국'],
    ['HK', '홍콩', 'Hong Kong', '중국'],
    ['TW', '대만', 'Taiwan', '중국'],
    ['MO', '마카오', 'Macau', '중국'],
    ['VN', '베트남', 'Vietnam', '동남아'],
    ['TH', '태국', 'Thailand', '동남아'],
    ['SG', '싱가포르', 'Singapore', '동남아'],
    ['MY', '말레이시아', 'Malaysia', '동남아'],
    ['ID', '인도네시아', 'Indonesia', '동남아'],
    ['PH', '필리핀', 'Philippines', '동남아'],
    ['MM', '미얀마', 'Myanmar', '동남아'],
    ['KH', '캄보디아', 'Cambodia', '동남아'],
    ['LA', '라오스', 'Laos', '동남아'],
    ['BN', '브루나이', 'Brunei', '동남아'],
    ['TL', '동티모르', 'Timor-Leste', '동남아'],
    ['IN', '인도', 'India', '동남아'],
    ['BD', '방글라데시', 'Bangladesh', '동남아'],
    ['LK', '스리랑카', 'Sri Lanka', '동남아'],
    ['NP', '네팔', 'Nepal', '동남아'],
    ['BT', '부탄', 'Bhutan', '동남아'],
    ['MV', '몰디브', 'Maldives', '동남아'],
    ['PK', '파키스탄', 'Pakistan', '동남아'],
    ['AF', '아프가니스탄', 'Afghanistan', '동남아'],
    ['MN', '몽골', 'Mongolia', '중국'],
    ['AE', '아랍에미리트(UAE)', 'United Arab Emirates', '중동/아프리카'],
    ['SA', '사우디아라비아', 'Saudi Arabia', '중동/아프리카'],
    ['QA', '카타르', 'Qatar', '중동/아프리카'],
    ['KW', '쿠웨이트', 'Kuwait', '중동/아프리카'],
    ['OM', '오만', 'Oman', '중동/아프리카'],
    ['BH', '바레인', 'Bahrain', '중동/아프리카'],
    ['YE', '예멘', 'Yemen', '중동/아프리카'],
    ['IR', '이란', 'Iran', '중동/아프리카'],
    ['IQ', '이라크', 'Iraq', '중동/아프리카'],
    ['IL', '이스라엘', 'Israel', '중동/아프리카'],
    ['PS', '팔레스타인', 'Palestine', '중동/아프리카'],
    ['JO', '요르단', 'Jordan', '중동/아프리카'],
    ['LB', '레바논', 'Lebanon', '중동/아프리카'],
    ['SY', '시리아', 'Syria', '중동/아프리카'],
    ['TR', '터키', 'Turkey', '중동/아프리카'],
    ['CY', '키프로스', 'Cyprus', '유럽'],
    ['GE', '조지아', 'Georgia', '중동/아프리카'],
    ['AM', '아르메니아', 'Armenia', '중동/아프리카'],
    ['AZ', '아제르바이잔', 'Azerbaijan', '중동/아프리카'],
    ['KZ', '카자흐스탄', 'Kazakhstan', '중동/아프리카'],
    ['UZ', '우즈베키스탄', 'Uzbekistan', '중동/아프리카'],
    ['TM', '투르크메니스탄', 'Turkmenistan', '중동/아프리카'],
    ['KG', '키르기스스탄', 'Kyrgyzstan', '중동/아프리카'],
    ['TJ', '타지키스탄', 'Tajikistan', '중동/아프리카'],
    ['EG', '이집트', 'Egypt', '중동/아프리카'],
    ['LY', '리비아', 'Libya', '중동/아프리카'],
    ['DZ', '알제리', 'Algeria', '중동/아프리카'],
    ['TN', '튀니지', 'Tunisia', '중동/아프리카'],
    ['MA', '모로코', 'Morocco', '중동/아프리카'],
    ['SD', '수단', 'Sudan', '중동/아프리카'],
    ['SS', '남수단', 'South Sudan', '중동/아프리카'],
    ['ET', '에티오피아', 'Ethiopia', '중동/아프리카'],
    ['ER', '에리트레아', 'Eritrea', '중동/아프리카'],
    ['DJ', '지부티', 'Djibouti', '중동/아프리카'],
    ['SO', '소말리아', 'Somalia', '중동/아프리카'],
    ['KE', '케냐', 'Kenya', '중동/아프리카'],
    ['UG', '우간다', 'Uganda', '중동/아프리카'],
    ['TZ', '탄자니아', 'Tanzania', '중동/아프리카'],
    ['RW', '르완다', 'Rwanda', '중동/아프리카'],
    ['BI', '부룬디', 'Burundi', '중동/아프리카'],
    ['NG', '나이지리아', 'Nigeria', '중동/아프리카'],
    ['GH', '가나', 'Ghana', '중동/아프리카'],
    ['CI', '코트디부아르', 'Côte d\'Ivoire', '중동/아프리카'],
    ['SN', '세네갈', 'Senegal', '중동/아프리카'],
    ['ML', '말리', 'Mali', '중동/아프리카'],
    ['BF', '부르키나파소', 'Burkina Faso', '중동/아프리카'],
    ['NE', '니제르', 'Niger', '중동/아프리카'],
    ['TD', '차드', 'Chad', '중동/아프리카'],
    ['CM', '카메룬', 'Cameroon', '중동/아프리카'],
    ['CF', '중앙아프리카공화국', 'Central African Republic', '중동/아프리카'],
    ['GA', '가봉', 'Gabon', '중동/아프리카'],
    ['CG', '콩고', 'Congo', '중동/아프리카'],
    ['CD', '콩고민주공화국(DRC)', 'DR Congo', '중동/아프리카'],
    ['AO', '앙골라', 'Angola', '중동/아프리카'],
    ['ZM', '잠비아', 'Zambia', '중동/아프리카'],
    ['ZW', '짐바브웨', 'Zimbabwe', '중동/아프리카'],
    ['MZ', '모잠비크', 'Mozambique', '중동/아프리카'],
    ['MW', '말라위', 'Malawi', '중동/아프리카'],
    ['BW', '보츠와나', 'Botswana', '중동/아프리카'],
    ['NA', '나미비아', 'Namibia', '중동/아프리카'],
    ['ZA', '남아프리카공화국', 'South Africa', '중동/아프리카'],
    ['LS', '레소토', 'Lesotho', '중동/아프리카'],
    ['SZ', '에스와티니', 'Eswatini', '중동/아프리카'],
    ['MG', '마다가스카르', 'Madagascar', '중동/아프리카'],
    ['MU', '모리셔스', 'Mauritius', '중동/아프리카'],
    ['SC', '세이셸', 'Seychelles', '중동/아프리카'],
    ['LR', '라이베리아', 'Liberia', '중동/아프리카'],
    ['SL', '시에라리온', 'Sierra Leone', '중동/아프리카'],
    ['GN', '기니', 'Guinea', '중동/아프리카'],
    ['GW', '기니비사우', 'Guinea-Bissau', '중동/아프리카'],
    ['GM', '감비아', 'Gambia', '중동/아프리카'],
    ['CV', '카보베르데', 'Cabo Verde', '중동/아프리카'],
    ['MR', '모리타니', 'Mauritania', '중동/아프리카'],
    ['TG', '토고', 'Togo', '중동/아프리카'],
    ['BJ', '베냉', 'Benin', '중동/아프리카'],
    ['GQ', '적도기니', 'Equatorial Guinea', '중동/아프리카'],
    ['ST', '상투메프린시페', 'São Tomé', '중동/아프리카'],
    ['KM', '코모로', 'Comoros', '중동/아프리카'],
    ['AU', '호주', 'Australia', '호주/뉴질랜드'],
    ['NZ', '뉴질랜드', 'New Zealand', '호주/뉴질랜드'],
    ['PG', '파푸아뉴기니', 'Papua New Guinea', '호주/뉴질랜드'],
    ['FJ', '피지', 'Fiji', '호주/뉴질랜드'],
    ['SB', '솔로몬제도', 'Solomon Islands', '호주/뉴질랜드'],
    ['VU', '바누아투', 'Vanuatu', '호주/뉴질랜드'],
    ['NC', '뉴칼레도니아', 'New Caledonia', '호주/뉴질랜드'],
    ['PF', '프랑스령 폴리네시아', 'French Polynesia', '호주/뉴질랜드'],
    ['WS', '사모아', 'Samoa', '호주/뉴질랜드'],
    ['TO', '통가', 'Tonga', '호주/뉴질랜드'],
    ['KI', '키리바시', 'Kiribati', '호주/뉴질랜드'],
    ['TV', '투발루', 'Tuvalu', '호주/뉴질랜드'],
    ['NR', '나우루', 'Nauru', '호주/뉴질랜드'],
    ['PW', '팔라우', 'Palau', '호주/뉴질랜드'],
    ['FM', '미크로네시아', 'Micronesia', '호주/뉴질랜드'],
    ['MH', '마셜제도', 'Marshall Islands', '호주/뉴질랜드'],
    ['CK', '쿡제도', 'Cook Islands', '호주/뉴질랜드'],
    ['NU', '니우에', 'Niue', '호주/뉴질랜드'],
    ['GU', '괌', 'Guam', '호주/뉴질랜드'],
    ['DE', '독일', 'Germany', '유럽'],
    ['FR', '프랑스', 'France', '유럽'],
    ['UK', '영국', 'United Kingdom', '유럽'],
    ['IE', '아일랜드', 'Ireland', '유럽'],
    ['NL', '네덜란드', 'Netherlands', '유럽'],
    ['BE', '벨기에', 'Belgium', '유럽'],
    ['LU', '룩셈부르크', 'Luxembourg', '유럽'],
    ['CH', '스위스', 'Switzerland', '유럽'],
    ['AT', '오스트리아', 'Austria', '유럽'],
    ['LI', '리히텐슈타인', 'Liechtenstein', '유럽'],
    ['MC', '모나코', 'Monaco', '유럽'],
    ['IT', '이탈리아', 'Italy', '유럽'],
    ['ES', '스페인', 'Spain', '유럽'],
    ['PT', '포르투갈', 'Portugal', '유럽'],
    ['GR', '그리스', 'Greece', '유럽'],
    ['MT', '몰타', 'Malta', '유럽'],
    ['SM', '산마리노', 'San Marino', '유럽'],
    ['VA', '바티칸', 'Vatican', '유럽'],
    ['AD', '안도라', 'Andorra', '유럽'],
    ['SE', '스웨덴', 'Sweden', '유럽'],
    ['NO', '노르웨이', 'Norway', '유럽'],
    ['FI', '핀란드', 'Finland', '유럽'],
    ['DK', '덴마크', 'Denmark', '유럽'],
    ['IS', '아이슬란드', 'Iceland', '유럽'],
    ['FO', '페로제도', 'Faroe Islands', '유럽'],
    ['EE', '에스토니아', 'Estonia', '유럽'],
    ['LV', '라트비아', 'Latvia', '유럽'],
    ['LT', '리투아니아', 'Lithuania', '유럽'],
    ['PL', '폴란드', 'Poland', '유럽'],
    ['CZ', '체코', 'Czech', '유럽'],
    ['SK', '슬로바키아', 'Slovakia', '유럽'],
    ['HU', '헝가리', 'Hungary', '유럽'],
    ['RO', '루마니아', 'Romania', '유럽'],
    ['BG', '불가리아', 'Bulgaria', '유럽'],
    ['SI', '슬로베니아', 'Slovenia', '유럽'],
    ['HR', '크로아티아', 'Croatia', '유럽'],
    ['BA', '보스니아헤르체고비나', 'Bosnia & Herzegovina', '유럽'],
    ['RS', '세르비아', 'Serbia', '유럽'],
    ['ME', '몬테네그로', 'Montenegro', '유럽'],
    ['MK', '북마케도니아', 'North Macedonia', '유럽'],
    ['AL', '알바니아', 'Albania', '유럽'],
    ['XK', '코소보', 'Kosovo', '유럽'],
    ['MD', '몰도바', 'Moldova', '유럽'],
    ['BY', '벨라루스', 'Belarus', '유럽'],
    ['RU', '러시아', 'Russia', '유럽'],
    ['UA', '우크라이나', 'Ukraine', '유럽'],
    ['US', '미국', 'United States', '북미'],
    ['CA', '캐나다', 'Canada', '북미'],
    ['MX', '멕시코', 'Mexico', '북미'],
    ['GL', '그린란드', 'Greenland', '북미'],
    ['GT', '과테말라', 'Guatemala', '남미'],
    ['BZ', '벨리즈', 'Belize', '남미'],
    ['SV', '엘살바도르', 'El Salvador', '남미'],
    ['HN', '온두라스', 'Honduras', '남미'],
    ['NI', '니카라과', 'Nicaragua', '남미'],
    ['CR', '코스타리카', 'Costa Rica', '남미'],
    ['PA', '파나마', 'Panama', '남미'],
    ['CU', '쿠바', 'Cuba', '남미'],
    ['JM', '자메이카', 'Jamaica', '남미'],
    ['HT', '아이티', 'Haiti', '남미'],
    ['DO', '도미니카공화국', 'Dominican Republic', '남미'],
    ['PR', '푸에르토리코', 'Puerto Rico', '남미'],
    ['TT', '트리니다드토바고', 'Trinidad & Tobago', '남미'],
    ['BB', '바베이도스', 'Barbados', '남미'],
    ['BS', '바하마', 'Bahamas', '남미'],
    ['GD', '그레나다', 'Grenada', '남미'],
    ['LC', '세인트루시아', 'Saint Lucia', '남미'],
    ['VC', '세인트빈센트', 'Saint Vincent', '남미'],
    ['KN', '세인트키츠네비스', 'Saint Kitts & Nevis', '남미'],
    ['AG', '앤티가바부다', 'Antigua & Barbuda', '남미'],
    ['DM', '도미니카', 'Dominica', '남미'],
    ['BR', '브라질', 'Brazil', '남미'],
    ['AR', '아르헨티나', 'Argentina', '남미'],
    ['CL', '칠레', 'Chile', '남미'],
    ['PE', '페루', 'Peru', '남미'],
    ['CO', '콜롬비아', 'Colombia', '남미'],
    ['VE', '베네수엘라', 'Venezuela', '남미'],
    ['EC', '에콰도르', 'Ecuador', '남미'],
    ['UY', '우루과이', 'Uruguay', '남미'],
    ['PY', '파라과이', 'Paraguay', '남미'],
    ['BO', '볼리비아', 'Bolivia', '남미'],
    ['GY', '가이아나', 'Guyana', '남미'],
    ['SR', '수리남', 'Suriname', '남미']
  ];
  // ─────────────────────────────────────────────────────────
  // 다중통화 — 기본값(폴백용)은 정적 환율, loadFx()에서 frankfurter.app API로
  // 실시간 ECB 기준 환율 자동 갱신 (영업일 1회, 약 16:00 CET 기준).
  // 사용자는 각 통화 환율을 직접 수정 가능.
  // ─────────────────────────────────────────────────────────
  var CURRENCIES = [
    { code: 'USD', name: '미국 달러',        rate: 1450.00, unit: 1   },
    { code: 'EUR', name: '유로',             rate: 1560.00, unit: 1   },
    { code: 'JPY', name: '일본 엔',          rate: 9.40,    unit: 1   },  // per JPY
    { code: 'CNY', name: '중국 위안',         rate: 200.00,  unit: 1   },
    { code: 'GBP', name: '영국 파운드',       rate: 1820.00, unit: 1   },
    { code: 'AUD', name: '호주 달러',         rate: 920.00,  unit: 1   },
    { code: 'CAD', name: '캐나다 달러',       rate: 1060.00, unit: 1   },
    { code: 'CHF', name: '스위스 프랑',       rate: 1620.00, unit: 1   },
    { code: 'HKD', name: '홍콩 달러',         rate: 186.00,  unit: 1   },
    { code: 'SGD', name: '싱가포르 달러',     rate: 1080.00, unit: 1   }
  ];

  // ─────────────────────────────────────────────────────────
  // KIDI 해상보험요율서 품목 코드 (Interest Code 201~306)
  // 각 항목 → RATE_TABLE 의 cargo 그룹으로 매핑
  // ─────────────────────────────────────────────────────────
  var KIDI_ITEMS = [
    { code: '201-1', label: '201-① 직제품 (면·모·화학섬유)',           group: '섬유류 (201-202)', cargo: 'textile'   },
    { code: '201-2', label: '201-② 원면 (Raw Cotton)',                   group: '섬유류 (201-202)', cargo: 'textile'   },
    { code: '201-3', label: '201-③ 생사 (Raw Silk)',                     group: '섬유류 (201-202)', cargo: 'textile'   },
    { code: '201-4', label: '201-④ 양모 (Wool)',                         group: '섬유류 (201-202)', cargo: 'textile'   },
    { code: '202',   label: '202   모피 및 피혁류 (Fur & Hides)',         group: '섬유류 (201-202)', cargo: 'textile'   },
    { code: '203',   label: '203   곡물류·사료·유채류 (Grain/Feed/Oilseed)', group: '농산·임산물류 (203-204)', cargo: 'foodstuff' },
    { code: '204-1', label: '204-① 원목·대나무 (Logs, Bamboo)',          group: '농산·임산물류 (203-204)', cargo: 'general'   },
    { code: '204-2', label: '204-② 가공목재 (Plywood, Lumber)',          group: '농산·임산물류 (203-204)', cargo: 'general'   },
    { code: '204-3', label: '204-③ 고무 (Rubber)',                       group: '농산·임산물류 (203-204)', cargo: 'general'   },
    { code: '204-4', label: '204-④ 잎담배 (Leaf Tobacco)',               group: '농산·임산물류 (203-204)', cargo: 'foodstuff' },
    { code: '205-1', label: '205-① 펄프 (Pulp)',                          group: '지류·화학류 (205-209)', cargo: 'general'   },
    { code: '205-2', label: '205-② 지류 (Paper)',                         group: '지류·화학류 (205-209)', cargo: 'general'   },
    { code: '206',   label: '206   비료 (Fertilizer) ※세부조건',           group: '지류·화학류 (205-209)', cargo: 'chemical'  },
    { code: '207',   label: '207   유류 (Oil)',                            group: '지류·화학류 (205-209)', cargo: 'liquid'    },
    { code: '208',   label: '208   유지류 (Oil Fats)',                     group: '지류·화학류 (205-209)', cargo: 'liquid'    },
    { code: '209-1', label: '209-① 화공품 (액체) (Chemicals · Liquid)',    group: '지류·화학류 (205-209)', cargo: 'chemical'  },
    { code: '209-2', label: '209-② 화공품 (고체) (Chemicals · Solid)',     group: '지류·화학류 (205-209)', cargo: 'chemical'  },
    { code: '209-3', label: '209-③ 의약품 (Pharmaceuticals)',              group: '지류·화학류 (205-209)', cargo: 'chemical'  },
    { code: '210-1', label: '210-① 일반식품 (General Foodstuff)',          group: '식품류 (210-211)', cargo: 'foodstuff' },
    { code: '210-2', label: '210-② 냉장·냉동식품 (Chilled/Frozen Food)',   group: '식품류 (210-211)', cargo: 'frozen'    },
    { code: '211-1', label: '211-① 어류 (Fish)',                           group: '식품류 (210-211)', cargo: 'frozen'    },
    { code: '211-2', label: '211-② 육류 (Meat)',                           group: '식품류 (210-211)', cargo: 'frozen'    },
    { code: '212-1', label: '212-① 소형 포유류 (Small Mammals)',           group: '동물류 (212)', cargo: 'general'   },
    { code: '212-2', label: '212-② 대형 포유류 (Large Mammals)',           group: '동물류 (212)', cargo: 'general'   },
    { code: '212-3', label: '212-③ 뱀류 (Snakes)',                         group: '동물류 (212)', cargo: 'general'   },
    { code: '212-4', label: '212-④ 조류 (Birds)',                          group: '동물류 (212)', cargo: 'general'   },
    { code: '212-5', label: '212-⑤ 수생생물 (Aquatic Animals)',            group: '동물류 (212)', cargo: 'general'   },
    { code: '213-1', label: '213-① 광산물 1류 (Minerals Type 1)',           group: '광물류 (213-214)', cargo: 'metal' },
    { code: '213-2', label: '213-② 광산물 2류 (Minerals Type 2)',           group: '광물류 (213-214)', cargo: 'metal' },
    { code: '214',   label: '214   석탄류 (Coal)',                           group: '광물류 (213-214)', cargo: 'general' },
    { code: '215-1', label: '215-① 철금속 (Ferrous Metals)',                 group: '금속류 (215)', cargo: 'metal' },
    { code: '215-2', label: '215-② 비철금속 (Non-ferrous Metals)',           group: '금속류 (215)', cargo: 'metal' },
    { code: '216-1', label: '216-① 일반기계 (General Machinery)',            group: '기계류 (216)', cargo: 'machinery' },
    { code: '216-2', label: '216-② 정밀기계 (Precision Machinery)',          group: '기계류 (216)', cargo: 'machinery' },
    { code: '216-3', label: '216-③ 전자제품·반도체 (Electronics)',           group: '기계류 (216)', cargo: 'machinery' },
    { code: '216-4', label: '216-④ 자동차 (Automobiles)',                    group: '기계류 (216)', cargo: 'machinery' },
    { code: '216-5', label: '216-⑤ 중장비 (Heavy Equipment)',                group: '기계류 (216)', cargo: 'machinery' },
    { code: '217',   label: '217   유리·요업제품 (Glass & Ceramic)',          group: '기타', cargo: 'fragile' },
    { code: '301',   label: '301   화폐·귀금속·보석 (Bank Note/Bullion/Jewelry)', group: '기타', cargo: 'art'     },
    { code: '302',   label: '302   이사화물 (Household Goods)',                group: '기타', cargo: 'general' },
    { code: '303',   label: '303   잡화 (General Merchandise)',                group: '기타', cargo: 'general' },
    { code: '304',   label: '304   서적·인쇄물 (Books & Printed Matter)',       group: '기타', cargo: 'general' },
    { code: '305',   label: '305   예술품·골동품 (Art & Antiques)',             group: '기타', cargo: 'art'     },
    { code: '306',   label: '306   군수물자 (Defense Materials)',               group: '기타', cargo: 'general' }
  ];

  // 단일 요율 (KIDI 참조요율 + 메리츠화재 기준) — 화물군별 6개 약관 (단위 %)
  // 시장 실제 적용 요율 수준에 맞춰 보정 (2026-04-27)
  var RATE_TABLE = {
    'general':   { name: '일반화물',         icc_a: 0.0130, icc_b: 0.0090, icc_c: 0.0070, ar: 0.0125, wa: 0.0085, fpa: 0.0065 },
    'machinery': { name: '기계·전자',        icc_a: 0.0150, icc_b: 0.0105, icc_c: 0.0080, ar: 0.0145, wa: 0.0100, fpa: 0.0075 },
    'metal':     { name: '철강·금속',        icc_a: 0.0165, icc_b: 0.0115, icc_c: 0.0090, ar: 0.0160, wa: 0.0110, fpa: 0.0085 },
    'textile':   { name: '섬유·의류',        icc_a: 0.0155, icc_b: 0.0108, icc_c: 0.0085, ar: 0.0150, wa: 0.0103, fpa: 0.0080 },
    'foodstuff': { name: '식품·농수산',      icc_a: 0.0230, icc_b: 0.0160, icc_c: 0.0120, ar: 0.0220, wa: 0.0150, fpa: 0.0115 },
    'frozen':    { name: '냉동·냉장',        icc_a: 0.0270, icc_b: 0.0190, icc_c: 0.0150, ar: 0.0260, wa: 0.0180, fpa: 0.0145 },
    'chemical':  { name: '화학·위험물',      icc_a: 0.0290, icc_b: 0.0205, icc_c: 0.0165, ar: 0.0280, wa: 0.0195, fpa: 0.0160 },
    'liquid':    { name: '석유·액체',        icc_a: 0.0180, icc_b: 0.0125, icc_c: 0.0100, ar: 0.0175, wa: 0.0120, fpa: 0.0095 },
    'fragile':   { name: '취약·도자기·유리', icc_a: 0.0330, icc_b: 0.0230, icc_c: 0.0180, ar: 0.0320, wa: 0.0220, fpa: 0.0175 },
    'art':       { name: '예술품·귀금속',    icc_a: 0.0450, icc_b: null,   icc_c: null,   ar: 0.0430, wa: null,   fpa: null   }
  };

  // KIDI zone 별 region factor
  var REGION_FACTOR = {
    '보세/외항':     0.80,
    '국내연안':       0.85,
    '일본':           0.95,
    '중국':           1.00,
    '동남아':         1.05,
    '중동/아프리카':  1.20,
    '호주/뉴질랜드':  1.10,
    '유럽':           1.15,
    '북미':           1.10,
    '남미':           1.30,
    '기타':           1.40
  };
  var MODE_FACTOR = { 'sea': 1.00, 'air': 0.65, 'land': 1.10, 'multimodal': 1.05 };

  var CLAUSE_LABEL = {
    'icc_a': '신약관 ICC(A) — All Risks',
    'icc_b': '신약관 ICC(B) — 한정담보',
    'icc_c': '신약관 ICC(C) — 최소담보',
    'ar':    '구약관 A.R — All Risks (S.G. Policy)',
    'wa':    '구약관 W.A — With Average',
    'fpa':   '구약관 F.P.A — Free from Particular Average'
  };

  // 화물 카테고리 → KIDI 추천 코드
  var CARGO_TO_KIDI = {
    'general':   '303',    'machinery': '216-3', 'metal':     '215-1',
    'textile':   '201-1',  'foodstuff': '210-1', 'frozen':    '210-2',
    'chemical':  '209-1',  'liquid':    '207',   'fragile':   '217',
    'art':       '305'
  };

  function $(id) { return document.getElementById(id); }
  function fmt(n) { return Math.round(n).toLocaleString('ko-KR'); }
  function fmt2(n) { return Number(n).toLocaleString('ko-KR', {minimumFractionDigits: 2, maximumFractionDigits: 2}); }

  function getCurrency(code) {
    return CURRENCIES.find(function (c) { return c.code === code; }) || CURRENCIES[0];
  }

  function lookupCountryRegion(name) {
    if (!name) return null;
    var ft = String(name).trim();
    if (!ft) return null;
    var c = COUNTRIES.find(function (c) {
      return c[1] === ft || c[2].toLowerCase() === ft.toLowerCase() || c[0] === ft.toUpperCase();
    });
    if (!c) {
      c = COUNTRIES.find(function (c) {
        return c[1].indexOf(ft) > -1 || c[2].toLowerCase().indexOf(ft.toLowerCase()) > -1;
      });
    }
    return c ? c[3] : null;
  }

  function deriveRegion() {
    var trade = $('calcTrade').value;
    var origin = $('calcOrigin').value;
    var dest = $('calcDest').value;
    var oRegion = lookupCountryRegion(origin);
    var dRegion = lookupCountryRegion(dest);
    if (oRegion === '국내연안' && dRegion === '국내연안') return '국내연안';
    var foreign = trade === 'export' ? dRegion : oRegion;
    return foreign || '기타';
  }

  function lookupHs(input) {
    if (!input || !window.HS_DB) return null;
    var q = String(input).trim().replace(/[^0-9]/g, '');
    if (q.length < 2) return null;
    if (q.length >= 4) {
      var e4 = window.HS_DB.find(function (h) { return h.hs === q.substring(0, 4); });
      if (e4) return e4;
    }
    return window.HS_DB.find(function (h) { return h.hs.indexOf(q) === 0; }) || null;
  }

  function onHsInput() {
    var raw = $('calcHs').value;
    var match = lookupHs(raw);
    var hint = $('calcHsHint');
    if (match) {
      var kidiCode = CARGO_TO_KIDI[match.cargo] || '303';
      var cargoSel = $('calcCargo');
      if (cargoSel) cargoSel.value = kidiCode;
      var kidiItem = KIDI_ITEMS.find(function (i) { return i.code === kidiCode; });
      var rateName = kidiItem ? RATE_TABLE[kidiItem.cargo].name : '';
      if (hint) {
        hint.innerHTML = '✓ <strong>' + match.name + '</strong> → KIDI 품목 ' +
          '<strong style="color:var(--accent);">' + (kidiItem ? kidiItem.label : rateName) + '</strong> ' +
          '<span style="color:var(--ink-2);font-size:.78rem;">(HS → KIDI 자동 매핑)</span>';
        hint.style.color = 'var(--forest)';
      }
    } else if (raw && raw.length >= 2) {
      if (hint) {
        hint.textContent = '⚠ HS 코드(4자리)를 찾을 수 없습니다. KIDI 품목군을 직접 선택해 주세요.';
        hint.style.color = 'var(--accent)';
      }
    } else {
      if (hint) hint.innerHTML = '예: <strong>8471</strong>(컴퓨터·216-③), <strong>7208</strong>(열연강판·215-①), <strong>0901</strong>(커피·210-①), <strong>2710</strong>(석유·207)';
      if (hint) hint.style.color = 'var(--ink-2)';
    }
  }

  function onRegionDerive() {
    var region = deriveRegion();
    var regionSel = $('calcRegion');
    if (regionSel && !regionSel.dataset.userTouched) {
      regionSel.value = region;
    } else if (regionSel && regionSel.value) {
      region = regionSel.value;
    }
    var hint = $('calcRouteHint');
    if (hint) {
      var trade = $('calcTrade').value === 'export' ? '수출' : '수입';
      var origin = $('calcOrigin').value || '?';
      var dest = $('calcDest').value || '?';
      hint.innerHTML = trade + ' · ' + origin + ' → ' + dest +
        ' · 운송지역: <strong style="color:var(--forest);">' + region + '</strong>' +
        ' <span style="color:var(--ink-2);font-size:.78rem;">(KIDI zone 자동매핑 — 필요 시 수정)</span>';
    }
    return region;
  }

  function onRegionUserChange() {
    var regionSel = $('calcRegion');
    if (regionSel) regionSel.dataset.userTouched = '1';
    onRegionDerive();
  }

  // 통화 변경 시 환율 자동세팅
  function onCurrencyChange() {
    var ccyCode = $('calcCcy').value;
    var ccy = getCurrency(ccyCode);
    var fxEl = $('calcFx');
    if (fxEl) fxEl.value = ccy.rate;
    var fxLbl = $('calcFxLabel');
    if (fxLbl) fxLbl.textContent = '적용 환율 (₩/' + ccy.code + ')';
    var cifLbl = $('calcCifLabel');
    if (cifLbl) cifLbl.textContent = '화물가액 CIF (' + ccy.code + ')';
    updateInsuredAmt();
  }

  function updateInsuredAmt() {
    var cif = parseFloat($('calcCif').value) || 0;
    var fx = parseFloat($('calcFx').value) || 1450;
    var ccyCode = $('calcCcy') ? $('calcCcy').value : 'USD';
    var insuredCcy = cif * 1.10;
    var insuredKRW = insuredCcy * fx;
    var hint = $('calcInsuredHint');
    if (hint) {
      hint.innerHTML = '보험가입금액 (CIF×110%): <strong>' + ccyCode + ' ' + fmt(insuredCcy) +
        '</strong> ≈ <strong>₩' + fmt(insuredKRW) + '</strong>';
    }
  }

  function doCalc() {
    var kidiCode = $('calcCargo').value;
    var cif = parseFloat($('calcCif').value);
    var clause = $('calcClause').value;
    var mode = $('calcMode').value || 'sea';
    var fx = parseFloat($('calcFx').value) || 1450;
    var ccyCode = $('calcCcy') ? $('calcCcy').value : 'USD';
    var trade = $('calcTrade').value || 'export';
    var origin = $('calcOrigin').value;
    var dest = $('calcDest').value;
    var hs = $('calcHs').value;
    var regionSel = $('calcRegion');
    var manualRegion = regionSel ? regionSel.value : '';

    if (!kidiCode || !cif || cif <= 0 || !origin || !dest) {
      alert('수출/수입 · 출발지 · 도착지 · 화물 품목 · 화물가액(CIF)을 모두 입력해 주세요.');
      return;
    }
    var kidiItem = KIDI_ITEMS.find(function (i) { return i.code === kidiCode; });
    if (!kidiItem) { alert('KIDI 품목코드 매핑 실패: ' + kidiCode); return; }
    var rateInfo = RATE_TABLE[kidiItem.cargo];
    if (!rateInfo) { alert('화물군 매핑 실패: ' + kidiItem.cargo); return; }
    var baseRate = rateInfo[clause];
    if (baseRate === null || baseRate === undefined) {
      alert('이 화물(예술품·귀금속)은 선택한 약관이 적용되지 않습니다. ICC(A) 또는 구약관 A.R를 선택해 주세요.');
      return;
    }

    var region = manualRegion || onRegionDerive();
    var insuredCcy = cif * 1.10;
    var insuredKRW = insuredCcy * fx;
    var rFactor = REGION_FACTOR[region] || 1.4;
    var mFactor = MODE_FACTOR[mode] || 1.0;
    var rate = baseRate * rFactor * mFactor;
    var premium = insuredKRW * (rate / 100);
    var MIN_PREMIUM = 13000;
    if (premium < MIN_PREMIUM) premium = MIN_PREMIUM;

    $('calcResPremium').textContent = '₩' + fmt(premium);
    $('calcResCargo').textContent = kidiItem.label + '  · 화물군 ' + rateInfo.name;
    $('calcResHs').textContent = hs ? hs + ' (자동 분류)' : '직접 선택';
    $('calcResClause').textContent = CLAUSE_LABEL[clause] || clause;
    $('calcResRoute').textContent = origin + ' → ' + dest + ' (zone: ' + region + ')';
    $('calcResTrade').textContent = trade === 'export' ? '수출 (Export)' : '수입 (Import)';
    $('calcResInsured').textContent = '₩' + fmt(insuredKRW) + ' (' + ccyCode + ' ' + fmt(insuredCcy) + ')';
    $('calcResRate').textContent = rate.toFixed(4) + '%';
    $('calcResFx').textContent = '₩' + fmt2(fx) + ' / ' + ccyCode + ' (전일 종가 전신환 매도율)';

    var resultEl = $('calcResult');
    if (resultEl) {
      resultEl.classList.add('is-shown');
      resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    var consultLink = $('calcConsultLink');
    if (consultLink) {
      var memo = '[적하] ' + (trade === 'export' ? '수출' : '수입') +
        ' / ' + origin + '→' + dest + ' (' + region + ')' +
        ' / HS:' + (hs || '-') + ' / KIDI ' + kidiCode + ' ' + rateInfo.name +
        ' / CIF ' + ccyCode + ' ' + fmt(cif) +
        ' / ' + (CLAUSE_LABEL[clause] || clause);
      consultLink.href = 'https://n2nib.com/consult.html?product=적하보험&memo=' + encodeURIComponent(memo);
    }
  }

  function loadFx() {
    var hint = $('calcFxHint');
    if (!hint) return;
    hint.innerHTML = '환율 불러오는 중…';

    var symbols = CURRENCIES.map(function (c) { return c.code; }).join(',');
    var url = 'https://api.frankfurter.app/latest?from=KRW&to=' + symbols;

    fetch(url, { cache: 'no-store' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        if (!data || !data.rates) throw new Error('Invalid response');
        // data.rates[XXX] = (XXX 단위/1 KRW). KRW/XXX = 1 / 위 값.
        CURRENCIES.forEach(function (c) {
          var perKrw = data.rates[c.code];
          if (perKrw && perKrw > 0) {
            c.rate = Math.round((1 / perKrw) * 100) / 100;  // 소수 둘째자리 반올림
          }
        });
        var dateStr = data.date || new Date().toISOString().substring(0, 10);
        hint.innerHTML = '✓ 최종 갱신 ' + dateStr + ' · ECB 기준 환율 자동 적용 ' +
          '<span style="color:var(--ink-2);font-size:.74rem;">(영업일 1회 갱신, 통화 변경 시 자동세팅, 수동 수정 가능)</span>';
        // 현재 선택된 통화로 환율 input 즉시 갱신
        onCurrencyChange();
      })
      .catch(function (err) {
        var d = new Date();
        d.setDate(d.getDate() - 1);
        var dateStr = d.toISOString().substring(0, 10);
        hint.innerHTML = '⚠ 자동 환율 조회 실패 — 예시 환율 적용 중 ' +
          '<span style="color:var(--ink-2);font-size:.74rem;">(' + dateStr + ' 기준 정적 값, 수동 수정 가능)</span>';
      });
  }

  function fillCountryDatalist() {
    var dl = $('countryList');
    if (!dl) return;
    dl.innerHTML = COUNTRIES.map(function (c) {
      return '<option value="' + c[1] + '">' + c[2] + ' (' + c[0] + ')</option>';
    }).join('');
  }

  function fillKidiCargoSelect() {
    var sel = $('calcCargo');
    if (!sel) return;
    var groups = {};
    var groupOrder = [];
    KIDI_ITEMS.forEach(function (it) {
      if (!groups[it.group]) { groups[it.group] = []; groupOrder.push(it.group); }
      groups[it.group].push(it);
    });
    var html = '<option value="">선택하세요…</option>';
    groupOrder.forEach(function (g) {
      html += '<optgroup label="' + g + '">';
      groups[g].forEach(function (it) {
        html += '<option value="' + it.code + '">' + it.label + '</option>';
      });
      html += '</optgroup>';
    });
    sel.innerHTML = html;
  }

  function fillRegionSelect() {
    var sel = $('calcRegion');
    if (!sel) return;
    sel.innerHTML = REGIONS.map(function (r) {
      return '<option value="' + r + '">' + r + '</option>';
    }).join('');
  }

  function fillCurrencySelect() {
    var sel = $('calcCcy');
    if (!sel) return;
    sel.innerHTML = CURRENCIES.map(function (c) {
      return '<option value="' + c.code + '">' + c.code + ' — ' + c.name + '</option>';
    }).join('');
  }

  document.addEventListener('DOMContentLoaded', function () {
    fillCountryDatalist();
    fillKidiCargoSelect();
    fillRegionSelect();
    fillCurrencySelect();
    var cifEl = $('calcCif');
    if (cifEl) cifEl.addEventListener('input', updateInsuredAmt);
    var hsEl = $('calcHs');
    if (hsEl) {
      hsEl.addEventListener('input', onHsInput);
      hsEl.addEventListener('blur', onHsInput);
    }
    var fxEl = $('calcFx');
    if (fxEl) fxEl.addEventListener('input', updateInsuredAmt);
    var ccyEl = $('calcCcy');
    if (ccyEl) ccyEl.addEventListener('change', onCurrencyChange);
    ['calcTrade', 'calcOrigin', 'calcDest'].forEach(function (id) {
      var el = $(id);
      if (el) {
        el.addEventListener('change', onRegionDerive);
        el.addEventListener('input', onRegionDerive);
      }
    });
    var regionEl = $('calcRegion');
    if (regionEl) regionEl.addEventListener('change', onRegionUserChange);
    var btn = $('calcSubmit');
    if (btn) btn.addEventListener('click', doCalc);
    onCurrencyChange();   // 초기 통화 라벨/환율 세팅
    updateInsuredAmt();
    loadFx();
    onRegionDerive();
    onHsInput();
  });
})();
