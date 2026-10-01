#!/usr/bin/env python3
"""
木場駅（東西線 西船橋方面）の最新時刻表データを取得・正規化してJSONを生成するスクリプト
"""
import urllib.request
import json
import re
import os
import sys

def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    target_public = os.path.join(base_dir, 'public', 'timetable.json')
    target_src = os.path.join(base_dir, 'src', 'data', 'defaultTimetable.json')

    headers = {'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'}
    kinds = {
        'weekday': 1,
        'saturday': 2,
        'holiday': 4
    }

    result = {
        'station': '木場',
        'direction': '西船橋・東葉勝田台方面',
        'updatedAt': '2026-10-01',
        'schedules': {}
    }

    print('Fetching timetable for Kiba Station (Tozai Line -> Nishi-Funabashi)...')
    for name, kind_val in kinds.items():
        url = f'https://transit.yahoo.co.jp/timetable/22638/3311?kind={kind_val}'
        req = urllib.request.Request(url, headers=headers)
        try:
            with urllib.request.urlopen(req) as resp:
                html = resp.read().decode('utf-8')
        except Exception as e:
            print(f'Error fetching {url}: {e}', file=sys.stderr)
            sys.exit(1)

        m = re.search(r'id=\"__NEXT_DATA__\"[^>]*>(.*?)</script>', html)
        if not m:
            print(f'Failed to extract __NEXT_DATA__ for {name}', file=sys.stderr)
            sys.exit(1)

        data = json.loads(m.group(1))
        tt = data['props']['pageProps']['timetableItem']

        kind_master = {k['id']: k['name'] for k in tt.get('master', {}).get('kind', [])}
        dest_master = {d['id']: d['name'] for d in tt.get('master', {}).get('destination', [])}

        trains = []
        for h_entry in tt.get('hourTimeTable', []):
            hour = int(h_entry['hour'])
            for m_entry in h_entry.get('minTimeTable', []):
                minute = int(m_entry['minute'])
                k_id = m_entry.get('kindId')
                d_id = m_entry.get('destinationId')
                k_name = kind_master.get(k_id, '各駅停車')
                d_name = dest_master.get(d_id, '西船橋')
                trains.append({
                    'hour': hour,
                    'minute': minute,
                    'timeStr': f'{hour:02d}:{minute:02d}',
                    'kind': k_name,
                    'isRapid': (k_name == '快速' or '快速' in k_name),
                    'destination': d_name
                })

        trains.sort(key=lambda x: (x['hour'] if x['hour'] >= 4 else x['hour'] + 24, x['minute']))
        result['schedules'][name] = trains
        print(f'  ✓ {name}: {len(trains)} trains (rapids: {sum(1 for t in trains if t["isRapid"])})')

    with open(target_public, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    with open(target_src, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    print(f'Successfully updated: {target_public} and {target_src}')

if __name__ == '__main__':
    main()
